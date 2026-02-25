import{c as a}from"./index-DduWlyHt.js";import{t as i,d as g}from"./pt-BR-Cb6bWWUC.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=a("TrendingDown",[["polyline",{points:"22 17 13.5 8.5 8.5 13.5 2 7",key:"1r2t7k"}],["polyline",{points:"16 17 22 17 22 11",key:"11uiuu"}]]);function y(e,n){const s=i(e),o=i(n),t=l(s,o),r=Math.abs(g(s,o));s.setDate(s.getDate()-t*r);const u=+(l(s,o)===-t),c=t*(r-u);return c===0?0:c}function l(e,n){const s=e.getFullYear()-n.getFullYear()||e.getMonth()-n.getMonth()||e.getDate()-n.getDate()||e.getHours()-n.getHours()||e.getMinutes()-n.getMinutes()||e.getSeconds()-n.getSeconds()||e.getMilliseconds()-n.getMilliseconds();return s<0?-1:s>0?1:s}export{p as T,y as d};
