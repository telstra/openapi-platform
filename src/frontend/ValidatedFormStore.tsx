import { observable, action, computed, comparer, IComputedValue } from 'mobx';

/**
 * Represents the result of an input validation function where the input is determined to be valid.
 */
interface ValidationResultOk {
  valid: true;
  reason?: never;
}

/**
 * Represents the result of an input validation function where the input is determined to be
 * invalid.
 */
interface ValidationResultError {
  valid: false;

  /**
   * A message describing why the input is invalid.
   */
  reason: string;
}

/**
 * Represents the result of an input validation function.
 */
export type ValidationResult = ValidationResultOk | ValidationResultError;

/**
 * Represents an input validation function that determines whether or not a given input is valid.
 */
export type ValidationFunction = (value: string) => ValidationResult;

/**
 * Returns a ValidationResultOk, indicating that an input was valid.
 */
export const inputValid: () => ValidationResult = () => ({ valid: true });

/**
 * Returns a ValidationResult indicating that an input was invalid, along with a reason why it was
 * invalid.
 */
export const inputInvalid: (reason: string) => ValidationResult = reason => ({
  valid: false,
  reason,
});

/**
 * A ValidationFunction that always returns a ValidationResultOk.
 */
export const alwaysValid: ValidationFunction = (value: string) => inputValid();

/**
 * A class responsible for storing form input data and validation logic.
 *
 * @template I A string literal type defining the names of the form inputs in the form.
 */
export class ValidatedFormStore<I extends string> {
  /**
   * Maps each form input to its validation function, wrapped in a MobX computed value.
   */
  private readonly inputValidationFunctions: Map<
    I,
    IComputedValue<ValidationResult>
  > = new Map();

  /**
   * Maps each form input to its current value.
   */
  @observable
  private readonly inputValues: Map<I, string> = new Map();

  /**
   * Maps each form input to its current error message, if it has one.
   */
  @observable
  private readonly inputErrors: Map<I, string> = new Map();

  /**
   * Creates the ValidatedForm.
   *
   * @param inputs An object describing the how each input should be validated, and what its initial
   *               value should be.
   * @param inputs.validation A ValidationFunction called each time the input needs to be validated.
   * @param inputs.initialValue The initial value of the input.
   */
  public constructor(
    inputs: { [key in I]: { validation: ValidationFunction; initialValue: string } },
  ) {
    for (const input of Object.keys(inputs) as I[]) {
      const validate = inputs[input].validation;
      this.inputValidationFunctions.set(
        input,
        computed(() => validate(this.getInputValue(input)), {
          equals: comparer.structural,
        }),
      );
      this.setInputValue(input, inputs[input].initialValue);
    }
  }

  private validateInput(input: I): ValidationResult {
    return (this.inputValidationFunctions.get(input) as IComputedValue<
      ValidationResult
    >).get();
  }

  @action
  private clearInputError(input: I) {
    this.inputErrors.delete(input);
  }

  @action
  private setInputError(input: I, error: string) {
    this.inputErrors.set(input, error);
  }

  /**
   * Evaluates to true if all form inputs are valid, false otherwise.
   */
  @computed
  public get inputsValid(): boolean {
    let valid = true;
    for (const [input] of this.inputValues) {
      valid = valid && this.validateInput(input).valid;
      if (!valid) {
        break;
      }
    }
    return valid;
  }

  /**
   * Gets the current value of the given form input.
   */
  public getInputValue(input: I): string {
    return this.inputValues.get(input) as string;
  }

  /**
   * Sets the value of the given form input to the given string.
   */
  @action
  public setInputValue(input: I, value: string) {
    this.inputValues.set(input, value);
    if (this.getInputError(input) !== null) {
      const result = this.validateInput(input);
      if (result.valid) {
        // An error message was displayed, but now the user has fixed the reason
        this.clearInputError(input);
      } else if (result.reason !== this.getInputError(input)) {
        // The displayed error message has now changed to a different one
        this.setInputError(input, result.reason);
      }
    }
  }

  /**
   * Gets the current error message associated with the given form input, or null if the form input
   * has no current error message.
   */
  public getInputError(input: I): string | null {
    if (this.inputErrors.has(input)) {
      return this.inputErrors.get(input) as string;
    }
    return null;
  }

  /**
   * Validates the given form input, updating its associated error message if the validation failed.
   */
  public updateInputError(input: I) {
    const result = this.validateInput(input);
    if (!result.valid) {
      this.setInputError(input, result.reason);
    }
  }

  /**
   * Validates all form inputs, updating any associated error messages where validation fails.
   */
  public updateAllInputErrors() {
    this.inputValues.forEach((value, input) => {
      this.updateInputError(input);
    });
  }
}
