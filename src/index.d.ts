// The public surface is declared by hand: the implementation is JavaScript, so there is
// no compiler step that could emit this file. It lives under src/ because that is the
// one place a build step cannot quietly remove it — it used to sit in dist/, tracked in
// git despite being gitignored, and a commit that cleaned the build directory deleted it
// without anything in the publish path disagreeing. 6.2.0 and 6.2.1 shipped a package
// whose `typings` field pointed at a file the tarball did not contain. (RSRMID-3085)
//
// rollup-esm.config.mjs copies it to dist/index.d.ts, where `typings` points, and
// tools/verify-pack.mjs fails the build if it is not in the pack output.

/**
 * Options forwarded to `tr46` unchanged, except for `transitionalProcessing`: this
 * package derives that one from the TLD of the domain name being converted, and only
 * uses the value given here when the caller sets it explicitly.
 */
export interface Options {
  /**
   * When set to `true`, any bi-directional text within the input will be checked for
   * validation.
   * @default false
   */
  checkBidi?: boolean | undefined;
  /**
   * When set to `true`, the positions of any hyphen characters within the input will be
   * checked for validation.
   * @default false
   */
  checkHyphens?: boolean | undefined;
  /**
   * When set to `true`, any word joiner characters within the input will be checked for
   * validation.
   * @default false
   */
  checkJoiners?: boolean | undefined;
  /**
   * When set to `true`, invalid Punycode labels are passed through instead of failing
   * validation.
   * @default false
   */
  ignoreInvalidPunycode?: boolean | undefined;
  /**
   * When set to `true`, symbols within the input are validated according to the older
   * IDNA2003 protocol rather than IDNA2008. Omit the property to have it detected from
   * the TLD of the input, which is the behaviour this package exists for — passing an
   * explicit `undefined` is not the same as omitting it, and turns the detection off.
   */
  transitionalProcessing?: boolean | undefined;
  /**
   * When set to `true`, input will be validated according to
   * [STD3 Rules](http://unicode.org/reports/tr46/#STD3_Rules).
   * @default false
   */
  useSTD3ASCIIRules?: boolean | undefined;
  /**
   * When set to `true`, the length of each DNS label within the input will be checked
   * for validation.
   * @default false
   */
  verifyDNSLength?: boolean | undefined;
}

/**
 * @deprecated Use {@link Options}. The `processingOption` this type used to add was
 * dropped by `tr46` in favour of the boolean `transitionalProcessing`, so it has had
 * no effect for several majors.
 */
export type ToASCIIOptions = Options;

/**
 * @deprecated Nothing accepts this type any more: `tr46` replaced `processingOption`
 * with the boolean `transitionalProcessing`, so there is no property left for it to
 * describe. It is exported only so that an existing `import type` keeps compiling, and
 * is removed in the next major.
 */
export type ProcessingOption = "nontransitional" | "transitional";

/**
 * The options `toUnicode` accepts. `verifyDNSLength` is absent because the length check
 * lives in `tr46`'s ASCII conversion only, so passing it here would do nothing.
 */
export type ToUnicodeOptions = Omit<Options, "verifyDNSLength">;

/**
 * The pair `convert` returns: the Unicode form and the Punycode form of each input.
 */
export interface ConversionResult<T extends string | string[]> {
  IDN: T;
  PC: T;
}

/**
 * Converts a string of Unicode symbols to a case-folded Punycode string of ASCII symbols
 * while considering transitional specifics for the underlying tld.
 *
 * @throws If the domain name cannot be translated to ASCII.
 */
export function toAscii(domainName: string, options?: Options): string;

/**
 * Converts a case-folded Punycode string of ASCII symbols to a string of Unicode symbols
 * while considering transitional specifics for the underlying tld.
 *
 * @throws If the domain name cannot be translated to Unicode.
 */
export function toUnicode(
  domainName: string,
  options?: ToUnicodeOptions,
): string;

/**
 * Converts the given domain name(s) to punycode and ascii while considering transitional
 * specifics for the underlying tlds. A domain name that cannot be converted is returned
 * unchanged in both forms rather than throwing.
 */
export function convert(
  domainNames: string,
  options?: Options,
): ConversionResult<string>;
export function convert(
  domainNames: string[],
  options?: Options,
): ConversionResult<string[]>;
export function convert(
  domainNames: string | string[],
  options?: Options,
): ConversionResult<string> | ConversionResult<string[]>;
