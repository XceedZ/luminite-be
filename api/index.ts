import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { jwt } from '@elysiajs/jwt';
import { swagger } from '@elysiajs/swagger';
import { db } from '../src/db';
import { users } from '../src/db/schema';
import { registerUser, loginUser } from '../src/controllers/auth.controller';
import { getAllActiveUsers } from '../src/dao/users';
import { STATUS, MESSAGES, ERROR_MESSAGES, getMessage } from '../src/constants';

// Root route - harus didefinisikan sebelum middleware
// @ts-ignore - Elysia types may not be fully recognized in Vercel build
const app = new Elysia()
  // @ts-ignore
  .use(cors({
    origin: true, // Allow all origins, or specify specific origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }))
  .get('/', (context: any) => {
    return {
      message: 'Welcome to Elysia.js Backend API',
      docs: `https://${process.env.VERCEL_URL || 'your-domain'}/docs`,
      swagger_ui: `https://${process.env.VERCEL_URL || 'your-domain'}/docs`,
      endpoints: {
        register: 'POST /api/v1/register',
        login: 'POST /api/v1/login',
        logout: 'POST /api/v1/logout',
        profile: 'GET /api/v1/profile (protected)',
        users: 'GET /api/v1/users (protected)'
      }
    };
  })
  // @ts-ignore
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
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    }
  }));

// API routes dengan prefix v1
// @ts-ignore
const apiRoutes = new Elysia({ prefix: '/api/v1' })
  // @ts-ignore
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'your-secret-key'
  }))

  // Public: Register
  .post('/register', async (context: any) => {
    const { body, set } = context;
    console.log('🟢 [REGISTER ENDPOINT] Request received:', {
      username: body.username,
      email: body.email,
      fullname: body.fullname,
      hasPassword: !!body.password,
      tenant_id: body.tenant_id
    });

    try {
      const result = await registerUser({
        username: body.username,
        email: body.email,
        password: body.password,
        fullname: body.fullname,
        tenant_id: body.tenant_id
      });

      console.log('🟢 [REGISTER ENDPOINT] Controller result:', {
        status: result.status,
        error: result.error,
        message: result.message,
        hasUser: !!result.data?.user
      });

      if (result.error) {
        set.status = result.status === STATUS.BAD_REQUEST ? 400 : 500;
        console.log('❌ [REGISTER ENDPOINT] Returning error response:', result);
        return {
          status: result.status,
          message: result.message
        };
      }

      console.log('✅ [REGISTER ENDPOINT] Returning success response');
      return result;
    } catch (error: any) {
      console.error('❌ [REGISTER ENDPOINT] Error:', error);
      set.status = 500;
      return {
        status: STATUS.INTERNAL_ERROR,
        message: getMessage(STATUS.INTERNAL_ERROR, ERROR_MESSAGES.INTERNAL_ERROR)
      };
    }
  }, {
    body: t.Object({
      username: t.String({ minLength: 3, maxLength: 30 }),
      fullname: t.String(),
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 6 }),
      tenant_id: t.Optional(t.Number())
    }),
    detail: { tags: ['Auth'] }
  })

  // Public: Login (support email or username)
  .post('/login', async (context: any) => {
    const { body, jwt, cookie: { auth }, set } = context;
    console.log('🟢 [LOGIN ENDPOINT] Request received:', {
      emailOrUsername: body.emailOrUsername,
      hasPassword: !!body.password
    });

    try {
      const result = await loginUser({
        emailOrUsername: body.emailOrUsername,
        password: body.password
      });

      console.log('🟢 [LOGIN ENDPOINT] Controller result:', {
        status: result.status,
        error: result.error,
        message: result.message
      });

      if (result.error) {
        set.status = 401;
        console.log('❌ [LOGIN ENDPOINT] Returning error response');
        return {
          status: result.status,
          message: result.message
        };
      }

      // Generate JWT token
      if (!result.data?.user) {
        set.status = 500;
        return {
          status: STATUS.INTERNAL_ERROR,
          message: getMessage(STATUS.INTERNAL_ERROR, ERROR_MESSAGES.INTERNAL_ERROR)
        };
      }

      console.log('🔵 [LOGIN ENDPOINT] Generating JWT token...');
      const token = await jwt.sign({ 
        user_id: result.data.user.user_id, 
        username: result.data.user.username, 
        fullname: result.data.user.fullname 
      });
      console.log('✅ [LOGIN ENDPOINT] JWT token generated');
      
      // Set cookie
      auth.set({ 
        value: token, 
        httpOnly: true, 
        maxAge: 7 * 24 * 60 * 60,
        sameSite: 'none',
        secure: true
      });  // 7 days
      console.log('✅ [LOGIN ENDPOINT] Cookie set');
      
      console.log('✅ [LOGIN ENDPOINT] Returning success response');
      return {
        status: result.status,
        message: result.message,
        data: {
          token,
          user: result.data.user
        }
      };
    } catch (error: any) {
      console.error('❌ [LOGIN ENDPOINT] Error:', error);
      set.status = 500;
      return {
        status: STATUS.INTERNAL_ERROR,
        message: getMessage(STATUS.INTERNAL_ERROR, ERROR_MESSAGES.INTERNAL_ERROR)
      };
    }
  }, {
    body: t.Object({
      emailOrUsername: t.String(), // Can be email or username
      password: t.String()
    }),
    detail: { tags: ['Auth'] }
  })

  // Public: Logout
  .post('/logout', async (context: any) => {
    const { cookie: { auth }, set } = context;
    console.log('🟢 [LOGOUT ENDPOINT] Request received');

    try {
      // Clear auth cookie
      auth.remove();
      console.log('✅ [LOGOUT ENDPOINT] Cookie cleared');

      return {
        status: STATUS.OK,
        message: getMessage(STATUS.OK, MESSAGES.LOGOUT_SUCCESS),
        error: false
      };
    } catch (error: any) {
      console.error('❌ [LOGOUT ENDPOINT] Error:', error);
      set.status = 500;
      return {
        status: STATUS.INTERNAL_ERROR,
        message: getMessage(STATUS.INTERNAL_ERROR, ERROR_MESSAGES.INTERNAL_ERROR)
      };
    }
  }, {
    detail: { tags: ['Auth'] }
  })

  // Protected: Profile (butuh JWT)
  .group('/profile', (app: any) =>
    app
      .derive(async (context: any) => {
        const { jwt, cookie: { auth }, set } = context;
        const profile = auth.value ? await jwt.verify(auth.value as string) : null;
        if (!profile) set.status = 401;
        return { user: profile };
      })
      .get('/', (context: any) => {
        const { user } = context;
        return { message: `Hello ${(user as any)?.fullname}!` };
      }, {
        beforeHandle: (context: any) => { 
          const { user, set } = context;
          if (!user) {
            set.status = 401;
            return 'Unauthorized';
          }
        },
        detail: { tags: ['Protected'], security: [{ bearerAuth: [] }] }
      })
  )

  // Contoh protected dengan Drizzle inference
  .get('/users', async (context: any) => {
    const { jwt, cookie: { auth } } = context;
    const profile = auth.value ? await jwt.verify(auth.value as string) : null;
    if (!profile) throw new Error('Unauthorized');
    const allUsers = await getAllActiveUsers();
    return allUsers;
  }, {
    detail: { tags: ['Protected'], security: [{ bearerAuth: [] }] },
    response: t.Array(t.Object({
      user_id: t.Number(),
      tenant_id: t.Number(),
      username: t.String(),
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
  });

// Gabungkan API routes dengan app utama
app.use(apiRoutes);

// Export handler untuk Vercel
// Vercel serverless function handler
export default async (req: any, res: any) => {
  try {
    console.log('📥 [VERCEL HANDLER] Request received:', {
      method: req.method,
      url: req.url,
      path: req.url?.split('?')[0]
    });

    // Get request URL
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const url = `${protocol}://${host}${req.url || '/'}`;

    console.log('🔗 [VERCEL HANDLER] Constructed URL:', url);

    // Convert headers
    const headers = new Headers();
    Object.entries(req.headers || {}).forEach(([key, value]) => {
      if (value && key.toLowerCase() !== 'host') {
        headers.set(key, String(value));
      }
    });

    // Handle body
    let body: string | undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.body) {
        // If body is already a string, use it; otherwise stringify
        body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      } else if (req.rawBody) {
        body = req.rawBody;
      }
    }

    console.log('📦 [VERCEL HANDLER] Body prepared:', body ? 'Yes' : 'No');

    // Create Fetch API Request
    const request = new Request(url, {
      method: req.method || 'GET',
      headers,
      body,
    });

    console.log('🚀 [VERCEL HANDLER] Handling request with Elysia...');

    // Handle request with Elysia
    const response = await app.handle(request);

    console.log('✅ [VERCEL HANDLER] Elysia response received:', {
      status: response.status,
      statusText: response.statusText
    });

    // Convert response headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value: string, key: string) => {
      responseHeaders[key] = value;
    });

    // Get response body
    const responseBody = await response.text();

    console.log('📤 [VERCEL HANDLER] Sending response...');

    // Send response
    res.status(response.status || 200);
    Object.entries(responseHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    res.send(responseBody);

    console.log('✅ [VERCEL HANDLER] Response sent successfully');
  } catch (error) {
    console.error('❌ [VERCEL HANDLER] Error:', error);
    console.error('❌ [VERCEL HANDLER] Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('❌ [VERCEL HANDLER] Error details:', {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : 'Unknown',
      cause: error instanceof Error ? error.cause : undefined
    });

    // Ensure response is sent
    if (!res.headersSent) {
      res.status(500).json({ 
        status: 'ERROR', 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      });
    }
  }
};

