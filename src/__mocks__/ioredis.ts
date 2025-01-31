const Redis = jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    set: jest.fn(),
    get: jest.fn().mockResolvedValue(null), // Simulating empty cache
    del: jest.fn(),
    quit: jest.fn(),
}));

export default Redis;
