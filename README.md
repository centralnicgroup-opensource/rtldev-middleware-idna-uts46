# IDNA-UTS #46 in JavaScript

[![npm version](https://img.shields.io/npm/v/idna-uts46-hx.svg?style=flat)](https://www.npmjs.com/package/idna-uts46-hx)
[![node](https://img.shields.io/node/v/idna-uts46-hx.svg)](https://www.npmjs.com/package/idna-uts46-hx)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hexonet/idna-uts46/blob/master/CONTRIBUTING.md)

This module is a IDNA UTS46 connector library for javascript. In addition to the default functionality of tr46, we offer converting domain names to unicode / punycode considering the respective registry provider's behavior.

The [JS Punycode converter library](https://github.com/bestiejs/punycode.js/) is
a great tool for handling Unicode domain names, but it only implements the
Punycode encoding of domain labels, not the full IDNA algorithm. In simple
cases, a mere conversion to lowercase text before input would seem sufficient,
but the real mapping for strings is far more complex. This library implements
the full mapping for these strings, as defined by
[UTS #46](http://unicode.org/reports/tr46/).

## Resources

- [Documentation](https://support.centralnicreseller.com/hc/en-gb/articles/13509920188061-JavaScript-based-IDN-Converter)
- [Release Notes](https://github.com/hexonet/idna-uts46/releases)

## v6 Notes & Migration Guide

With v6 we migrated our library to npm package `tr46` as software dependency. By that step we use a library that is actively maintained in direction of correctly supporting the `TR46` standard and supporting the latest Version of the Unicode Standard. Reinventing the wheel isn't useful and something we have time or resources for. We were able to dramatically decrease the number of lines of code on our end.

### Improvements

- method `toUnicode` comes with auto-detection of `transitionalProcessing` setting based on the provided domain name input
- method `toAscii` comes with auto-detection of `transitionalProcessing` setting based on the provided domain name input

### Breaking Changes

In general, we don't see a blocker for upgrading to v6. Still, consider the below changes.

#### Performance

Runtime performance of v6 compared to v5 has slightly improved. The compression for the underlying idna mapping table is superfluous, tr46 covers it well.

#### New Labels for Options

The below configuration options for the methods `toUnicode`and `toAscii` must be renamed in case you're using them:

| **Option, old** | **Option, new**        |
| --------------- | ---------------------- |
| transitional    | transitionalProcessing |
| useStd3ASCII    | useSTD3ASCIIRules      |
| verifyDnsLength | verifyDNSLength        |

#### Behavior

Earlier versions kept option `transitional` by default to false which is now automatically detected and results may therefore differ.
This affects the `toAscii` method.

The `toUnicode` function did not allow for a options parameter in earlier versions, now it follows the exemplary way of package `tr46`.

## Authors

- [KaiSchwarz-cnic](https://github.com/kaischwarz-cnic)

**Thanks for the below former contributions:**

- Initial work done by [jcranmer](https://github.com/jcranmer).
- v5: Migration of the IDNA Mapping Table's Build Process from Python to NodeJS5 by [dawsbot](https://github.com/dawsbot)
- v5: Performance Improvements for the Browser Bundle's Page Load by [dawsbot](https://github.com/dawsbot)

See also the list of [contributors](https://github.com/hexonet/idna-uts46/graphs/contributors) who participated in this project.

## License

MIT
