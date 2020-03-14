module.exports = {
    "coverageThreshold": {
        "global": {
            "branches": 50,
            "functions": 50,
            "lines": 50,
            "statements": 50
        }
    },
    moduleNameMapper: {
        // '^@\/mxssfd$': '<rootDir>/node_modules/@mxssfd',
    },
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
        "^.+\\.js$": "babel-jest",
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    // 下面非要从重要, 将不忽略 lodash-es, other-es-lib 这些es库, 从而使babel-jest去处理它们
    // transformIgnorePatterns: ["<rootDir>/node_modules/(?!(lodash-es|other-es-lib))"]
    // transformIgnorePatterns: ["node_modules/(?!(@mxssfd/ts-utils))/"],
};