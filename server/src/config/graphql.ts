/**
 * GraphQL Configuration
 * Apollo Server entegrasyonu için yapılandırma
 */

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { Server as HttpServer } from 'http';
import { Request, Response, NextFunction, Application } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import logger from '../utils/logger';

// GraphQL Type Definitions
const typeDefs = `#graphql
  type Query {
    projects(limit: Int, offset: Int, status: String): [Project!]!
    project(id: ID!): Project
    equipment(limit: Int, offset: Int, status: String): [Equipment!]!
    equipmentItem(id: ID!): Equipment
    tasks(limit: Int, offset: Int, status: String): [Task!]!
    task(id: ID!): Task
    clients(limit: Int, offset: Int): [Client!]!
    client(id: ID!): Client
  }

  type Mutation {
    createProject(input: ProjectInput!): Project!
    updateProject(id: ID!, input: ProjectInput!): Project!
    deleteProject(id: ID!): Boolean!
  }

  type Project {
    id: ID!
    name: String!
    description: String
    startDate: String!
    endDate: String
    status: String!
    location: String
    client: Client
    team: [User!]!
    equipment: [Equipment!]!
    createdAt: String!
    updatedAt: String!
  }

  type Equipment {
    id: ID!
    name: String!
    type: String!
    model: String
    serialNumber: String
    status: String!
    location: String
    responsibleUser: User
    createdAt: String!
    updatedAt: String!
  }

  type Task {
    id: ID!
    title: String!
    description: String
    status: String!
    priority: String
    assignedTo: User
    project: Project
    dueDate: String
    createdAt: String!
    updatedAt: String!
  }

  type Client {
    id: ID!
    name: String!
    email: String
    phone: String
    address: String
    notes: String
    createdAt: String!
    updatedAt: String!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    isActive: Boolean!
  }

  input ProjectInput {
    name: String!
    description: String
    startDate: String!
    endDate: String
    status: String
    location: String
    clientId: ID!
    teamIds: [ID!]
    equipmentIds: [ID!]
  }
`;

// GraphQL Resolver Types
interface GraphQLContext {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

interface QueryArgs {
  limit?: number;
  offset?: number;
  status?: string;
  id?: string;
}

interface ProjectInput {
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status?: string;
  location?: string;
  clientId: string;
  teamIds?: string[];
  equipmentIds?: string[];
}

interface MutationArgs {
  id: string;
  input: ProjectInput;
}

// GraphQL Resolvers
const resolvers = {
  Query: {
    projects: async (_: unknown, args: QueryArgs, _context: GraphQLContext) => {
      const { Project } = await import('../models');
      const query: Record<string, unknown> = {};
      if (args.status) query.status = args.status;
      return Project.find(query)
        .limit(args.limit || 10)
        .skip(args.offset || 0)
        .populate('client')
        .populate('team')
        .populate('equipment');
    },
    project: async (_: unknown, args: { id: string }, _context: GraphQLContext) => {
      const { Project } = await import('../models');
      return Project.findById(args.id).populate('client').populate('team').populate('equipment');
    },
    equipment: async (_: unknown, args: QueryArgs, _context: GraphQLContext) => {
      const { Equipment } = await import('../models');
      const query: Record<string, unknown> = {};
      if (args.status) query.status = args.status;
      return Equipment.find(query)
        .limit(args.limit || 10)
        .skip(args.offset || 0)
        .populate('responsibleUser');
    },
    equipmentItem: async (_: unknown, args: { id: string }, _context: GraphQLContext) => {
      const { Equipment } = await import('../models');
      return Equipment.findById(args.id).populate('responsibleUser');
    },
    tasks: async (_: unknown, args: QueryArgs, _context: GraphQLContext) => {
      const { Task } = await import('../models');
      const query: Record<string, unknown> = {};
      if (args.status) query.status = args.status;
      return Task.find(query)
        .limit(args.limit || 10)
        .skip(args.offset || 0)
        .populate('assignedTo')
        .populate('project');
    },
    task: async (_: unknown, args: { id: string }, _context: GraphQLContext) => {
      const { Task } = await import('../models');
      return Task.findById(args.id).populate('assignedTo').populate('project');
    },
    clients: async (_: unknown, args: QueryArgs, _context: GraphQLContext) => {
      const { Client } = await import('../models');
      return Client.find().limit(args.limit || 10).skip(args.offset || 0);
    },
    client: async (_: unknown, args: { id: string }, _context: GraphQLContext) => {
      const { Client } = await import('../models');
      return Client.findById(args.id);
    },
  },
  Mutation: {
    createProject: async (_: unknown, args: { input: ProjectInput }, _context: GraphQLContext) => {
      const { Project } = await import('../models');
      const project = await Project.create({
        ...args.input,
        client: args.input.clientId,
        team: args.input.teamIds || [],
        equipment: args.input.equipmentIds || [],
      });
      const populated = await project.populate('client');
      const populated2 = await populated.populate('team');
      return await populated2.populate('equipment');
    },
    updateProject: async (_: unknown, args: MutationArgs, _context: GraphQLContext) => {
      const { Project } = await import('../models');
      const updateData: Record<string, unknown> = { ...args.input };
      if (updateData.clientId) {
        updateData.client = updateData.clientId;
        delete updateData.clientId;
      }
      if (updateData.teamIds) {
        updateData.team = updateData.teamIds;
        delete updateData.teamIds;
      }
      if (updateData.equipmentIds) {
        updateData.equipment = updateData.equipmentIds;
        delete updateData.equipmentIds;
      }
      const project = await Project.findByIdAndUpdate(args.id, updateData, { new: true });
      if (!project) return null;
      const populated = await project.populate('client');
      const populated2 = await populated.populate('team');
      return await populated2.populate('equipment');
    },
    deleteProject: async (_: unknown, args: { id: string }, _context: GraphQLContext) => {
      const { Project } = await import('../models');
      await Project.findByIdAndDelete(args.id);
      return true;
    },
  },
};

/**
 * GraphQL server'ı başlat
 */
export const initGraphQL = async (httpServer: HttpServer, app: Application): Promise<ApolloServer | null> => {
  // GraphQL sadece ENABLE_GRAPHQL=true olduğunda aktif
  if (process.env.ENABLE_GRAPHQL !== 'true') {
    return null;
  }
  
  try {
    const schema = makeExecutableSchema({ typeDefs, resolvers });

    const server = new ApolloServer({
      schema,
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
      introspection: process.env.NODE_ENV !== 'production', // Production'da introspection kapalı
    });

    await server.start();

    // GraphQL endpoint'i ekle
    // Authentication için custom middleware
    const graphqlAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
      try {
        // authenticate middleware'ini promise olarak wrap et
        await new Promise<void>((resolve, reject) => {
          authenticate(req, res, (err?: unknown) => {
            if (err) {
              // Error response zaten authenticate middleware'de gönderildi
              reject(err);
            } else {
              resolve();
            }
          });
        });
        next();
      } catch (error) {
        // Error zaten handle edildi (authenticate middleware'de)
        // next() çağrılmayacak, response zaten gönderildi
      }
    };

    app.use('/graphql', graphqlAuthMiddleware);
    app.use(
      '/graphql',
      expressMiddleware(server, {
        context: async ({ req }: { req: Request }) => {
          // Request'ten user bilgisini al (authenticate middleware'den gelir)
          return { user: (req as Request & { user?: { id: string; email: string; role: string } }).user };
        },
      })
    );

    logger.info('✅ GraphQL server başlatıldı: /graphql');
    return server;
  } catch (error) {
    logger.error('GraphQL server başlatma hatası:', error);
    throw error;
  }
};
