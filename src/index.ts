import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { swagger } from '@elysiajs/swagger';
import { createSelectSchema } from 'drizzle-typebox';
import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword, createUser, findUserByEmail } from './auth';

const app = new Elysia({ prefix: '/api' })
  .use(swagger({
    documentation: {
      info: { title: 'My Auth App', version: '1.0.0' },
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
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET!
  }))

  // Public: Register
  .post('/register', async ({ body }) => {
    const [newUser] = await createUser(body.email, body.password, body.name);
    return { message: 'User created', user: { id: newUser.id, name: newUser.name, email: newUser.email } };
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 6 })
    }),
    detail: { tags: ['Auth'] }
  })

  // Public: Login
  .post('/login', async ({ body, jwt, cookie: { auth }, set }) => {
    const [user] = await findUserByEmail(body.email);
    if (!user || !(await verifyPassword(body.password, user.password))) {
      set.status = 401;
      return { error: 'Invalid credentials' };
    }
    const token = await jwt.sign({ id: user.id, name: user.name });
    auth.set({ value: token, httpOnly: true, maxAge: 7 * 24 * 60 * 60 });  // 7 days
    return { message: 'Logged in', token };
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
      .get('/', ({ user }) => ({ message: `Hello ${(user as any)?.name}!` }), {
        beforeHandle: ({ user, set }) => { if (!user) set.status = 401, 'Unauthorized'; },
        detail: { tags: ['Protected'], security: [{ bearerAuth: [] }] }
      })
  )

  // Contoh protected dengan Drizzle inference
  .get('/users', async ({ jwt, cookie: { auth } }) => {
    const profile = auth.value ? await jwt.verify(auth.value as string) : null;
    if (!profile) throw new Error('Unauthorized');
    const allUsers = await db.select().from(users).where(eq(users.isActive, true));
    return allUsers;
  }, {
    detail: { tags: ['Protected'], security: [{ bearerAuth: [] }] },
    response: t.Array(t.Object({
      id: t.Number(),
      email: t.String(),
      name: t.String(),
      isActive: t.Union([t.Boolean(), t.Null()]),
      createdAt: t.Union([t.Date(), t.Null()])
    }))
  })

  .listen(3000);

console.log(`🦊 Elysia running at http://localhost:${app.server?.port}`);
console.log(`📖 Swagger docs: http://localhost:3000/swagger`);