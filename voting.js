Items = new Meteor.Collection("items");
var deleters = Array("AbmyphdodrfQSqP2X");
if (Meteor.isClient) {

  Template.item.items = function () {
    return Items.find({},{sort: {votes: -1, dt: -1}}).fetch();
  };

  Template.item.canDelete = function(owner) {
    return Meteor.userId() && ((owner === Meteor.userId()) || (_.contains(deleters,Meteor.userId())));
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
      if (e.which === 13 && Meteor.user() && !Items.findOne({text: $("#add").val().substring(0,150)})) {
        Items.insert({text: $("#add").val().substring(0,150), votes: 1, owner: Meteor.userId(), voted: Array(Meteor.userId()), colour: randcol(), dt: new Date()});
        $("#add").val('');
      }
    }
  });

  Template.main.events({
    'click .item' : function () {
      if(Meteor.user() && !_.contains(Items.findOne({_id: this._id}).voted,Meteor.userId())){
        Items.update({_id: this._id}, {$inc: {votes: 1}, $push: {voted: Meteor.userId()}});
      }
    },
    'click .delbtn' : function (e) {
      Items.remove({_id: this._id});
      e.stopImmediatePropagation();
    }
  });

  if(location.hash.substring(1,7) == "delete"){
    Items.remove({_id: location.hash.substring(8)});
  }

}


if (Meteor.isServer) {
  Meteor.startup(function () {
    Items.allow({
      insert: function (userId, doc) {
        // the user must be logged in
        return (userId);
      },
      update: function (userId, doc, fields, modifier) {
        // the user must be logged in
        return (userId);
      },
      remove: function (userId, doc) {
        // can only remove your own documents (unless admin)
        return userId && ((doc.owner === userId) || (_.contains(deleters,userId)));
      }
    });
  });

}
