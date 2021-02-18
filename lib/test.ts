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

export interface TestCase<InputT, OutputT> {
  name: string;
  input: InputT;
  expect: OutputT;
  testArgs?: DenoTestArgs;
}

export function testSuite<InputT, OutputT>(
  name: string,
  test: (testCase: TestCase<InputT, OutputT>) => void,
  cases: TestCase<InputT, OutputT>[],
) {
  cases.forEach((testCase) => {
    Deno.test({
      name: `${name} :: ${testCase.name}`,
      fn: () => test(testCase),
      ...testCase.testArgs,
    });
  });
}
