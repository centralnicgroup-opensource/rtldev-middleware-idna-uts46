import tr46 from 'tr46';

function getDefaultOptions(domainName) {
  return {
    transitionalProcessing: !domainName.match(
      /\.(?:art|be|ca|de|swiss|fr|pm|re|tf|wf|yt)\.?$/,
    ),
  };
}

function toAscii(domainName, options = {}) {
  const pc = tr46.toASCII(domainName, {
    ...getDefaultOptions(domainName),
    ...options,
  });
  if (pc !== null) {
    return pc;
  }
  throw new Error(`Unable to translate ${domainName} to ASCII.`);
}

function toUnicode(domainName, options = {}) {
  const idn = tr46.toUnicode(domainName, {
    ...getDefaultOptions(domainName),
    ...options,
  });
  if (idn !== null && !idn.error) {
    return idn.domain.toLocaleLowerCase();
  }
  if (idn !== null && /(^|\.)xn--/i.test(domainName)) {
    const lowercaseDomainName = idn.domain.toLocaleLowerCase();
    if (lowercaseDomainName !== idn.domain) {
      return lowercaseDomainName;
    }
  }
  throw new Error(`Unable to translate ${domainName} to Unicode.`);
}

function convert(domainNames, options = {}) {
  const isArrayInput = Array.isArray(domainNames);
  if (!isArrayInput) {
    domainNames = [domainNames];
  }
  const results = { IDN: [], PC: [] };
  domainNames.forEach((domainName) => {
    try {
      const uc = toUnicode(domainName, options);
      const pc = toAscii(uc, options);
      results.IDN.push(uc);
      results.PC.push(pc);
    } catch {
      results.PC.push(domainName);
      results.IDN.push(domainName);
    }
  });

  if (isArrayInput) {
    return results;
  }
  return { IDN: results.IDN[0], PC: results.PC[0] };
}

export { toUnicode, toAscii, convert };
