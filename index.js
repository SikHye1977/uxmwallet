/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import 'react-native-get-random-values'

import structuredClone from '@ungap/structured-clone';
import { TextEncoder, TextDecoder } from 'text-encoding';
import { Buffer } from 'buffer';

if (typeof global.structuredClone !== 'function') {
  global.structuredClone = structuredClone;
}

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}


AppRegistry.registerComponent(appName, () => App);
