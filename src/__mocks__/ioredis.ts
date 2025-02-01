const Redis = jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    set: jest.fn(),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn(),
    quit: jest.fn(),
    hgetall: jest.fn(),
}));

export default Redis;
