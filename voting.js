Items = new Meteor.Collection("items");
var deleters = Array("AbmyphdodrfQSqP2X");
if (Meteor.isClient) {

  Template.item.items = function () {
    return Items.find({},{sort: {votes: -1, dt: -1}}).fetch();
  };

  Template.item.canDelete = function(owner) {
    return Meteor.userId() && ((owner === Meteor.userId()) || (_.contains(deleters,Meteor.userId())));
  };

  Template.i.rendered = function() {
    if(this.rendered != this.data.votes){
      if(this.rendered){
        $('#vd').fadeIn(1000);
        $('#vd').fadeOut(1000);
        $('#voted_'+this.data._id).fadeIn(1000);
        $('#voted_'+this.data._id).fadeOut(1000);
      }
      $('#item_'+this.data._id).fadeOut(0);
      $('#item_'+this.data._id).fadeIn(500);
      this.rendered = this.data.votes;
    }
  };

  function randcol() {
    function rand(min, max) {
      return parseInt(Math.random() * (max-min+1), 10) + min;
    }
    var h = rand(1, 360); // color hue between 1 and 360
    var s = rand(90, 100); // saturation 30-100%
    var l = rand(35, 60); // lightness 30-70%
    return 'hsl(' + h + ',' + s + '%,' + l + '%)';
    }  
    
  Template.add.events({
    'keypress #add' : function (e) {
      if (e.which === 13 && Meteor.user() && !Items.findOne({text: $("#add").val().substring(0,150)})) {
        id = Items.insert({text: $("#add").val().substring(0,150), votes: 1, owner: Meteor.userId(), voted: Array(Meteor.userId()), colour: randcol(), dt: new Date()});
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
