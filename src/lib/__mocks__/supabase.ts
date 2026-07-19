export const supabase = {
  auth: {
    getUser: jest.fn(async () => ({ data: { user: { id: 'test-user' } } })),
  },
  from: jest.fn(() => supabase),
  select: jest.fn(() => supabase),
  insert: jest.fn(() => supabase),
  update: jest.fn(() => supabase),
  eq: jest.fn(() => supabase),
  gte: jest.fn(() => supabase),
  order: jest.fn(() => supabase),
  limit: jest.fn(() => supabase),
};
