import 'react-native-gesture-handler'; // MUST stay first
import 'react-native-reanimated';      // 👈 ADD THIS (second line)

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);