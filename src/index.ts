import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { jwt } from '@elysiajs/jwt';
import { swagger } from '@elysiajs/swagger';
import { createSelectSchema } from 'drizzle-typebox';
import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword, createUser, findUserByEmail } from './auth';
import { STATUS, MESSAGES, ERROR_MESSAGES, getMessage } from './constants';

// Test database connection
db.select().from(users).limit(1).then(() => {
  console.log('✅ Database connection successful');
}).catch((error) => {
  console.error('❌ Database connection failed:', error);
});

// Root route - harus didefinisikan sebelum middleware
const app = new Elysia()
  .use(cors({
    origin: true, // Allow all origins, or specify specific origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }))
  .get('/', ({ server }) => ({
    message: 'Welcome to Elysia.js Backend API',
    docs: `http://localhost:${server?.port}/docs`,
    swagger_ui: `http://localhost:${server?.port}/docs`,
    endpoints: {
      register: 'POST /api/register',
      login: 'POST /api/login',
      profile: 'GET /api/profile (protected)',
      users: 'GET /api/users (protected)'
    }
  }))
  .use(swagger({
    path: '/docs',
    documentation: {
      info: { title: 'Elysia.js Backend API', version: '1.0.0' },
      tags: [
        { name: 'Auth', description: 'Login/Register' },
        { name: 'Protected', description: 'Needs JWT' }
      ],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
        }
      }
    }
  }))

// API routes dengan prefix
const apiRoutes = new Elysia({ prefix: '/api' })
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET!
  }))

  // Public: Register
  .post('/register', async ({ body }) => {
    const [newUser] = await createUser(body.email, body.password, body.fullname, body.tenant_id || 1);
    return {
      status: STATUS.OK,
      message: getMessage(STATUS.OK, MESSAGES.USER_CREATED),
      data: { user: { user_id: newUser.user_id, fullname: newUser.fullname, email: newUser.email } }
    };
  }, {
    body: t.Object({
      fullname: t.String(),
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 6 }),
      tenant_id: t.Optional(t.Number())
    }),
    detail: { tags: ['Auth'] }
  })

  // Public: Login
  .post('/login', async ({ body, jwt, cookie: { auth }, set }) => {
    const [user] = await findUserByEmail(body.email);
    if (!user || !(await verifyPassword(body.password, user.password))) {
      set.status = 401;
      return { status: STATUS.UNAUTHORIZED, message: getMessage(STATUS.UNAUTHORIZED, ERROR_MESSAGES.INVALID_CREDENTIALS) };
    }
    const token = await jwt.sign({ user_id: user.user_id, fullname: user.fullname });
    auth.set({ value: token, httpOnly: true, maxAge: 7 * 24 * 60 * 60 });  // 7 days
    return { status: STATUS.OK, message: getMessage(STATUS.OK, MESSAGES.LOGIN_SUCCESS), data: { token } };
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String()
    }),
    detail: { tags: ['Auth'] }
  })

  // Protected: Profile (butuh JWT)
  .group('/profile', (app) =>
    app
      .derive(async ({ jwt, cookie: { auth }, set }) => {
        const profile = auth.value ? await jwt.verify(auth.value as string) : null;
        if (!profile) set.status = 401;
        return { user: profile };
      })
      .get('/', ({ user }) => ({ message: `Hello ${(user as any)?.fullname}!` }), {
        beforeHandle: ({ user, set }) => { if (!user) set.status = 401, 'Unauthorized'; },
        detail: { tags: ['Protected'], security: [{ bearerAuth: [] }] }
      })
  )

  // Contoh protected dengan Drizzle inference
  .get('/users', async ({ jwt, cookie: { auth } }) => {
    const profile = auth.value ? await jwt.verify(auth.value as string) : null;
    if (!profile) throw new Error('Unauthorized');
    const allUsers = await db.select().from(users).where(eq(users.active, 'Y'));
    return allUsers;
  }, {
    detail: { tags: ['Protected'], security: [{ bearerAuth: [] }] },
    response: t.Array(t.Object({
      user_id: t.Number(),
      tenant_id: t.Number(),
      email: t.String(),
      fullname: t.String(),
      phone: t.Union([t.String(), t.Null()]),
      private_key: t.Union([t.String(), t.Null()]),
      active: t.String(),
      active_datetime: t.Union([t.String(), t.Null()]),
      non_active_datetime: t.Union([t.String(), t.Null()]),
      create_user_id: t.Number(),
      update_user_id: t.Union([t.Number(), t.Null()]),
      create_datetime: t.Union([t.String(), t.Null()]),
      update_datetime: t.Union([t.String(), t.Null()]),
      version: t.Number()
    }))
  })

// Gabungkan API routes dengan app utama
app.use(apiRoutes)

app.listen(3000);

console.log(`🦊 Elysia running at http://localhost:${app.server?.port}`);
console.log(`📖 API docs: http://localhost:${app.server?.port}/docs`);