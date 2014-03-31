Items = new Meteor.Collection("items");
var deleters = Array("NPToaEvWZWA7hYbfB","bg9rZ8PEZsw2BvNiQ");
if (Meteor.isClient) {

  Meteor.startup(function () {
    Meteor.subscribe("all_items");
  });

  Template.item.items = function () {
    return Items.find({},{sort: {votes: -1, dt: -1}}).fetch();
  };

  Template.i.canDelete = function(owner) {
    return Meteor.userId() && ((owner === Meteor.userId()) || (_.contains(deleters,Meteor.userId())));
  };

  Template.i.isAdmin = function() {
    return _.contains(deleters,Meteor.userId());
  };

  Template.i.isWaitingForDelete = function(dels) {
    return _.contains(deleters,Meteor.userId()) && dels && dels.length > 0;
  };

  Template.i.canHelpDelete = function(dels) {
    return _.contains(deleters,Meteor.userId()) && !_.contains(dels,Meteor.userId());
  };

  Template.i.deletersRemaining = function(l) {
    return deleters.length - l;
  };

  Template.i.rendered = function() {
    if(this.rendered != this.data.votes){
      if(this.rendered && Session.get("voted_"+this.data._id) === true){
        Session.set("voted_"+this.data._id,null);
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
      txt = $("#add").val().substring(0,150).toLowerCase().trim();
      if (e.which === 13 && Meteor.user() && txt.length > 0 && !Items.findOne({text: txt})) {
        id = Items.insert({text: txt, votes: 1, owner: Meteor.userId(), voted: Array(Meteor.userId()), colour: randcol(), dt: new Date()});
        $("#add").val('');
      }
    }
  });

  Template.main.events({
    'click .item' : function () {
      if(Meteor.user() && !_.contains(Items.findOne({_id: this._id}).voted,Meteor.userId())){
        Items.update({_id: this._id}, {$inc: {votes: 1}, $push: {voted: Meteor.userId()}});
        Session.set("voted_"+this._id,true);
      }
    },
    'click .delbtn' : function (e) {
      e.stopImmediatePropagation();
      i = Items.findOne({_id: this._id})
      if(i.owner != Meteor.userId() && _.contains(deleters,Meteor.userId()) && !_.contains(i.deleters,Meteor.userId())){
        Items.update({_id: this._id}, {$push: {deleters: Meteor.userId()}})
        i = Items.findOne({_id: this._id})
      }
      if(i.owner == Meteor.userId() || (_.contains(deleters,Meteor.userId()) && i.deleters && i.deleters.length == deleters.length)){
        var del_id = this._id;
        $('#item_'+del_id).fadeOut(500);
        del = function(){
          Items.remove({_id: del_id});
        }
        setTimeout(del,500);
      }
    }
  });

  if(location.hash.substring(1,7) == "delete"){
    Items.remove({_id: location.hash.substring(8)});
  }

}


if (Meteor.isServer) {
  Meteor.startup(function () {
    Meteor.publish("userData", function () {
        if(_.contains(deleters,this.userId)){
          return Meteor.users.find();
        }
        return Meteor.users.find({_id: this.userId});
    });
    Meteor.publish("all_items", function () {
      return Items.find(); // everything
    });
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
