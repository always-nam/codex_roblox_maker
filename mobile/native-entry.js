import {Capacitor} from '@capacitor/core';
import {Clipboard} from '@capacitor/clipboard';
import {Filesystem,Directory,Encoding} from '@capacitor/filesystem';
import {Share} from '@capacitor/share';
const native=Capacitor.isNativePlatform();
if(native){
 window.PlaycraftNative={
  copy:async text=>Clipboard.write({string:text}),
  exportFile:async(name,text)=>{
   const safe=name.replace(/[\\/:*?"<>|]/g,'').slice(0,100);
   const result=await Filesystem.writeFile({path:`exports/${safe}`,data:text,directory:Directory.Cache,encoding:Encoding.UTF8,recursive:true});
   await Share.share({title:'게임 제작 프롬프트 내보내기',files:[result.uri],dialogTitle:'파일을 저장하거나 공유하세요'});
  }
 };
}
