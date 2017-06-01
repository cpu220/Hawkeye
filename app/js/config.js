$(document).ready(function(){


  $('.btn').on('click',function(){
    postJSON();
  });
});


function postJSON(){
  // var request = new Request('/users.json', {
  //   method: 'POST',
  //   mode: 'cors',
  //   body:'name=lilei',
  //   redirect: 'follow',
  //   headers: new Headers({
  //     'Content-Type': 'text/plain'
  //   })
  // });
  //
  // fetch(request).then(function(data) {
  //   console.log(data);
  // });
  jQuery.ajax({
    url:'/users.json',
    method:'POST',
    data:'aaaaaa',
    success:function(data){
      console.log('success');
    },
    error:function(err){
      console.log('err');
    }
  })


}