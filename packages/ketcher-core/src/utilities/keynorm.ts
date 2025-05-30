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

import * as KN from 'w3c-keyname';

const mac =
  typeof navigator !== 'undefined' ? /Mac/.test(navigator.platform) : false; // eslint-disable-line no-undef

function normalizeKeyName(name) {
  const parts = name.split(/\+(?!$)/);
  let result = parts[parts.length - 1];
  if (result === 'Space') result = ' ';
  let alt;
  let ctrl;
  let shift;
  let meta;

  for (let i = 0; i < parts.length - 1; i++) {
    const mod = parts[i];
    if (/^(cmd|meta|m)$/i.test(mod)) meta = true;
    else if (/^a(lt)?$/i.test(mod)) alt = true;
    else if (/^(c|ctrl|control)$/i.test(mod)) ctrl = true;
    else if (/^s(hift)?$/i.test(mod)) shift = true;
    else if (/^mod$/i.test(mod))
      if (mac) meta = true;
      else ctrl = true;
    else throw new Error('Unrecognized modifier name: ' + mod);
  }

  if (alt) result = 'Alt+' + result;
  if (ctrl) result = 'Ctrl+' + result;
  if (meta) result = 'Meta+' + result;
  if (shift) result = 'Shift+' + result;

  return result;
}

function normalizeKeyMap(map) {
  const copy = Object.create(null);

  Object.keys(map).forEach((prop) => {
    copy[normalizeKeyName(prop)] = map[prop];
  });

  return copy;
}

function modifiers(name, event, shift) {
  if (event.altKey) name = 'Alt+' + name;
  if (event.ctrlKey) name = 'Ctrl+' + name;
  if (event.metaKey) name = 'Meta+' + name;
  if (shift !== false && event.shiftKey) name = 'Shift+' + name;

  return name;
}

function symbolByEvent(event) {
  return event.shiftKey ? KN.shift[event.keyCode] : KN.base[event.keyCode];
}

function normalizeKeyEvent(event, base = false) {
  const name = symbolByEvent(event);
  const isChar = name.length === 1 && name !== ' ';

  return isChar && !base
    ? modifiers(name, event, !isChar)
    : modifiers(KN.base[event.keyCode], event, true);
}

export function isControlKey(event) {
  return mac ? event.metaKey : event.ctrlKey;
}

// TODO rename and unify after moving all hotkeys to core editor
//  to handle all events in same way and to have same structure for all hotkey configs
function keyNorm(obj) {
  if (obj instanceof KeyboardEvent) {
    return normalizeKeyEvent(obj);
  }

  return typeof obj === 'object' ? normalizeKeyMap(obj) : normalizeKeyName(obj);
}

function setHotKey(key, actName, hotKeys) {
  if (Array.isArray(hotKeys[key])) hotKeys[key].push(actName);
  else hotKeys[key] = [actName];
}

export function initHotKeys(actions) {
  const hotKeys = {};
  let act;

  Object.keys(actions).forEach((actName) => {
    act = actions[actName];
    if (!act.shortcut) return;

    if (Array.isArray(act.shortcut)) {
      act.shortcut.forEach((key) => {
        setHotKey(key, actName, hotKeys);
      });
    } else {
      setHotKey(act.shortcut, actName, hotKeys);
    }
  });

  return keyNorm(hotKeys);
}

function lookup(map, event) {
  let name = symbolByEvent(event);
  if (name === 'Add') name = '+'; // numpad '+' and '-'
  if (name === 'Subtract') name = '-';
  const isChar = name.length === 1 && name !== ' ';

  let res = map[modifiers(name, event, !isChar)];
  let baseName;

  if (event.shiftKey && isChar && (baseName = KN.base[event.keyCode])) {
    res = map[modifiers(baseName, event, true)] || res;
  }

  return res;
}

keyNorm.lookup = lookup;

export { keyNorm };
