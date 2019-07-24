var loadTextResources = function(url , callback){
   var request = new XMLHttpRequest();
   request.open('GET',url,true);
   request.onload = function(){
       if(request.status < 200 || request.status > 299){
           
       }
   };

};