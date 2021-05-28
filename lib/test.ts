/**
 * @module test.ts
 *
 * Testing utilities.
 */

/**
 * Subset of `Deno.TestDefinition` for extending test cases.
 */
export interface DenoTestArgs {
  /** If at lease one test has `only` set to true, only run tests that have
     * `only` set to true and fail the test suite. */
  only?: boolean;
  /** Check that the number of async completed ops after the test is the same
     * as number of dispatched ops. Defaults to true.*/
  sanitizeOps?: boolean;
  /** Ensure the test case does not "leak" resources - ie. the resource table
     * after the test has exactly the same contents as before the test. Defaults
     * to true. */
  sanitizeResources?: boolean;
}

/**
 * Defines parameters for a test case to be executed in a `testSuite`.
 */
export interface TestCase<InputT, OutputT> extends DenoTestArgs {
  /**
   * Description for the case being tested
   */
  case: string;
  /**
   * Input to test
   */
  input: InputT;
  /**
   * Expected output.
   */
  expect: OutputT;
}

/**
 * Defines a table-driven suite of tests.
 */
export class TestSuite<InputT, OutputT> {
  /**
   * Create a test suite.
   *
 * @param name name of the test suite, prepended to each test case
 * @param test function to execute on each test case, expected to call an `assert` or `fail` from the `asserts.ts` module.
 * @param cases test cases
   */
  constructor(
    name: string,
    test: (testCase: TestCase<InputT, OutputT>) => void,
    cases: TestCase<InputT, OutputT>[],
  ) {
    cases.forEach((testCase) => {
      Deno.test({
        name: `${name} :: ${testCase.case}`,
        fn: () => test(testCase),
        ...testCase,
      });
    });
  }
}

const lorenIpsum = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
];

/**
 * Each line is a sentence.
 */
export function lorenIpsumLines() {
  return [...lorenIpsum];
}

/**
 * Places all sentences on a single line.
 */
export function lorenIpsumText() {
  return lorenIpsum.join(" ");
}
