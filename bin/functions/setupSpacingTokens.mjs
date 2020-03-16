import { camelize } from './camelize.mjs';
import { formatName } from './formatName.mjs';
import { normalizeUnits } from './normalizeUnits.mjs';

import {
  errorSetupSpacingTokensNoFrame,
  errorSetupSpacingTokensNoChildren,
  errorSetupSpacingTokensMissingProps
} from '../meta/errors.mjs';

/**
 * Places all Figma spacings into a clean object
 *
 * @exports
 * @function
 * @param {object} spacingFrame - The spacing frame from Figma
 * @param {string} spacingUnit - The spacing unit
 * @returns {object} - Returns an object with all the spacings
 * @throws {error} - When there is no provided Figma frame
 */
export function setupSpacingTokens(spacingFrame, spacingUnit) {
  if (!spacingFrame) throw new Error(errorSetupSpacingTokensNoFrame);
  if (!spacingFrame.children) throw new Error(errorSetupSpacingTokensNoChildren);

  const SPACINGS = spacingFrame.children;
  const SPACING_OBJECT = {};

  const SPACE_ARRAY = [];

  SPACINGS.forEach(spacing => {
    if (!spacing.name || !spacing.absoluteBoundingBox)
      throw new Error(errorSetupSpacingTokensMissingProps);

    let normalizedName = camelize(spacing.name);
    normalizedName = formatName(normalizedName);
    const NORMALIZED_UNIT = normalizeUnits(spacing.absoluteBoundingBox.width, 'px', spacingUnit);
    SPACING_OBJECT[normalizedName] = NORMALIZED_UNIT;

    SPACE_ARRAY.push(NORMALIZED_UNIT);
  });

  SPACE_ARRAY.sort();
  // TODO: Investigate if possible to use units with Styled System...
  console.log('SPACE_ARRAY', SPACE_ARRAY);

  return SPACING_OBJECT;
}
