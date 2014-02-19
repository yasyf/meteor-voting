Items = new Meteor.Collection("items");
if (Meteor.isClient) {

  Template.item.items = function () {
    return Items.find({},{sort: {votes: -1, dt: -1}}).fetch();
  };

  function randcol() {
    var letters = '012345'.split('');
    var color = '#';        
    color += letters[Math.round(Math.random() * 5)];
    letters = '0123456789ABCDEF'.split('');
    for (var i = 0; i < 5; i++) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
    }  
    
  Template.add.events({
    'keypress #add' : function (e) {
      if (e.which === 13 && Meteor.user() && !Items.findOne({text: $("#add").val()})) {
        Items.insert({text: $("#add").val(), votes: 1, voted: Array(Meteor.userId()), colour: randcol(), dt: new Date()});
        $("#add").val('');
      }
    }
  });

  Template.main.events({
    'click .item' : function () {
      if(Meteor.user() && !_.contains(Items.findOne({_id: this._id}).voted,Meteor.userId())){
        Items.update({_id: this._id}, {$inc: {votes: 1}, $push: {voted: Meteor.userId()}});
      }
    }
  });

  if(location.hash.substring(1,7) == "delete"){
    Items.remove({_id: location.hash.substring(8)});
  }

}


if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
