import tr46 from 'tr46';

function getDefaultOptions(domain) {
  return {
    transitionalProcessing: !domain.match(
      /\.(?:be|ca|de|swiss|fr|pm|re|tf|wf|yt)\.?$/,
    ),
  };
}

function toAscii(domain, opts = {}) {
  const pc = tr46.toASCII(domain, { ...getDefaultOptions(domain), ...opts });
  if (pc !== null) {
    return pc;
  }
  throw new Error(`Unable to translate ${domain} to ASCII.`);
}

function toUnicode(domain, opts = {}) {
  const idn = tr46.toUnicode(domain, { ...getDefaultOptions(domain), ...opts });
  if (idn !== null && !idn.error) {
    return idn.domain;
  }
  throw new Error(`Unable to translate ${domain} to Unicode.`);
}

function convert(domains) {
  const isArrayInput = Array.isArray(domains);
  if (!isArrayInput) {
    domains = [domains];
  }
  const results = { IDN: [], PC: [] };
  domains.forEach((domain) => {
    try {
      results.PC.push(toAscii(domain));
      results.IDN.push(toUnicode(domain));
    } catch (e) {
      results.PC.push(domain);
      results.IDN.push(domain);
    }
  });

  if (isArrayInput) {
    return results;
  }
  return { IDN: results.IDN[0], PC: results.PC[0] };
}

export { toUnicode, toAscii, convert };
