import sanitizeHtml from 'sanitize-html';
import Turndown from 'turndown';
export const escapeHtml=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
export function cleanHtml(s:string){return sanitizeHtml(s,{allowedTags:['p','h1','h2','h3','h4','strong','em','s','ul','ol','li','blockquote','a','mark','br','hr','code','pre'],allowedAttributes:{a:['href','target','rel'],mark:[]},allowedSchemes:['https','http','mailto'],transformTags:{a:sanitizeHtml.simpleTransform('a',{rel:'noopener noreferrer'})}});}
export function htmlText(s:string){return new Turndown({headingStyle:'atx'}).turndown(cleanHtml(s)).replace(/^#{1,6} /gm,'').replace(/\*\*(.*?)\*\*/g,'$1').replace(/(?<!\*)\*([^*]+)\*/g,'$1').replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').replace(/^> /gm,'').trim();}
export function htmlFromBlocks(blocks:{text:string;heading:boolean;level:number}[]){return blocks.map(b=>`<${b.heading?'h'+Math.min(3,b.level+1):'p'}>${escapeHtml(b.text).replace(/\n/g,'<br>')}</${b.heading?'h'+Math.min(3,b.level+1):'p'}>`).join('');}
export const markdown=(html:string)=>new Turndown({headingStyle:'atx',bulletListMarker:'-'}).turndown(cleanHtml(html));
