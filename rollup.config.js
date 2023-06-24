// rollup.config.js
import { terser } from "rollup-plugin-terser";

export default {
  input: './state-them.js',
  output: {
    dir: 'dist',
    paths:{
      
    },
  },
  plugins: [],
  external:[],
    
};