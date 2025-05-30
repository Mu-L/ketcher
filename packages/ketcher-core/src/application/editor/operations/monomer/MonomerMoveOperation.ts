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

import { Operation } from 'domain/entities/Operation';
import { BaseMonomer } from 'domain/entities';
import { RenderersManager } from 'application/render/renderers/RenderersManager';

export class MonomerMoveOperation implements Operation {
  public monomer: BaseMonomer;
  constructor(
    private monomerMoveModelChange: () => BaseMonomer,
    private invertMonomerMoveModelChange: () => BaseMonomer,
  ) {
    this.monomer = this.monomerMoveModelChange();
  }

  public execute(renderersManager: RenderersManager) {
    this.monomer = this.monomerMoveModelChange();
    renderersManager.moveMonomer(this.monomer);
  }

  public invert(renderersManager: RenderersManager) {
    this.monomer = this.invertMonomerMoveModelChange();
    renderersManager.moveMonomer(this.monomer);
  }
}
