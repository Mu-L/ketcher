/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';
import { inRange } from 'lodash';
import type { BondAtoms, FlipDirection } from './utils.types';

let FRAC = Math.PI / 12; // '15º'

function setFracAngle(angle: number): void {
  FRAC = (Math.PI / 180) * angle;
}

function calcAngle(pos0: Vec2, pos1: Vec2): number {
  const v = Vec2.diff(pos1, pos0);
  return Math.atan2(v.y, v.x);
}

function fracAngle(angle, angle2): number {
  if (angle2) angle = calcAngle(angle, angle2);
  return Math.round(angle / FRAC) * FRAC;
}

function calcNewAtomPos(pos0: Vec2, pos1: Vec2, ctrlKey: boolean): Vec2 {
  const vector = new Vec2(1, 0).rotate(
    ctrlKey ? calcAngle(pos0, pos1) : fracAngle(pos0, pos1),
  );
  vector.add_(pos0); // eslint-disable-line no-underscore-dangle
  return vector;
}

function degrees(angle: number): number {
  let degree = Math.round((angle / Math.PI) * 180);
  if (degree > 180) degree -= 360;
  else if (degree <= -180) degree += 360;
  return degree;
}

const BONDS_MERGE_ANGLE = 10; // 'º'
const BONDS_MERGE_SCALE = 0.2;

function mergeBondsParams(
  struct1: Struct,
  bond1: BondAtoms,
  struct2: Struct,
  bond2: BondAtoms,
) {
  // TODO find a solution to remove not-null assertion from result atoms below
  // https://github.com/epam/ketcher/issues/2652
  const begin1 = struct1.atoms.get(bond1.begin)!;
  const begin2 = struct2.atoms.get(bond2.begin)!;
  const end1 = struct1.atoms.get(bond1.end)!;
  const end2 = struct2.atoms.get(bond2.end)!;

  const angle = calcAngle(begin1.pp, end1.pp) - calcAngle(begin2.pp, end2.pp);
  const mergeAngle = Math.abs(degrees(angle) % 180);

  const scale = Vec2.dist(begin1.pp, end1.pp) / Vec2.dist(begin2.pp, end2.pp);

  const merged =
    !inRange(mergeAngle, BONDS_MERGE_ANGLE, 180 - BONDS_MERGE_ANGLE) &&
    inRange(scale, 1 - BONDS_MERGE_SCALE, 1 + BONDS_MERGE_SCALE);

  return { merged, angle, scale, cross: Math.abs(degrees(angle)) > 90 };
}

export const rotateDelta = (v: Vec2, center: Vec2, angle: number) => {
  let v1 = v.sub(center);
  v1 = v1.rotate(angle);
  v1.add_(center); // eslint-disable-line no-underscore-dangle
  return v1.sub(v);
};

export const flipPointByCenter = (
  pointToFlip: Vec2,
  center: Vec2,
  flipDirection: FlipDirection,
) => {
  const d = new Vec2();
  if (flipDirection === 'horizontal') {
    d.x =
      center.x > pointToFlip.x
        ? 2 * (center.x - pointToFlip.x)
        : -2 * (pointToFlip.x - center.x);
  } else {
    // 'vertical'
    d.y =
      center.y > pointToFlip.y
        ? 2 * (center.y - pointToFlip.y)
        : -2 * (pointToFlip.y - center.y);
  }
  return d;
};

export default {
  calcAngle,
  fracAngle,
  degrees,
  setFracAngle,
  mergeBondsParams,
  calcNewAtomPos,
};
