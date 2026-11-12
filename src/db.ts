import Dexie, { type Table } from 'dexie';
export type Business={id:'business';name:string;owner:string;phone:string;email:string;address:string;gst:string;logo:string;currency:string;defaultGst:number;terms:string};
export type Customer={id:string;name:string;phone:string;email:string;address:string};
export type LineItem={id:string;description:string;quantity:number;price:number};
export type Document={id:string;kind:'invoice'|'quotation';number:string;date:string;dueDate:string;validUntil:string;customer:Customer;items:LineItem[];discount:number;gst:number;notes:string;terms:string;status:string;paid:number;total:number;createdAt:string};
class QuickDB extends Dexie { business!:Table<Business,string>; customers!:Table<Customer,string>; documents!:Table<Document,string>; constructor(){super('QuickInvoiceDB');this.version(1).stores({business:'id',customers:'id,name,phone',documents:'id,kind,number,date,status,createdAt'});} }
export const db=new QuickDB();
export const uid=()=>`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
export const calc=(items:LineItem[],discount:number,gst:number)=>{const subtotal=items.reduce((s,i)=>s+(Number(i.quantity)||0)*(Number(i.price)||0),0);const taxable=Math.max(0,subtotal-(Number(discount)||0));const tax=taxable*(Number(gst)||0)/100;return {subtotal,tax,total:taxable+tax};};
