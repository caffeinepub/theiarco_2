import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    // Other user metadata if needed
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  type PublisherId = Nat;

  public type Publisher = {
    id : PublisherId;
    fullName : Text;
    fieldServiceGroup : Nat;
    privileges : {
      publisher : Bool;
      servant : Bool;
      elder : Bool;
    };
    isGroupOverseer : Bool;
    isGroupAssistant : Bool;
    isActive : Bool;
    notes : Text;
  };

  let publishers = Map.empty<PublisherId, Publisher>();
  var nextPublisherId = 0;

  public shared ({ caller }) func addPublisher(
    fullName : Text,
    fieldServiceGroup : Nat,
    privileges : {
      publisher : Bool;
      servant : Bool;
      elder : Bool;
    },
    isGroupOverseer : Bool,
    isGroupAssistant : Bool,
    isActive : ?Bool,
    notes : ?Text,
  ) : async PublisherId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add publishers");
    };

    let publisher : Publisher = {
      id = nextPublisherId;
      fullName;
      fieldServiceGroup;
      privileges;
      isGroupOverseer;
      isGroupAssistant;
      isActive = switch (isActive) {
        case (null) { true };
        case (?value) { value };
      };
      notes = switch (notes) {
        case (null) { "" };
        case (?value) { value };
      };
    };

    publishers.add(nextPublisherId, publisher);
    nextPublisherId += 1;
    publisher.id;
  };

  public shared ({ caller }) func updatePublisher(
    id : PublisherId,
    fullName : Text,
    fieldServiceGroup : Nat,
    privileges : {
      publisher : Bool;
      servant : Bool;
      elder : Bool;
    },
    isGroupOverseer : Bool,
    isGroupAssistant : Bool,
    isActive : Bool,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update publishers");
    };

    switch (publishers.get(id)) {
      case (null) { Runtime.trap("Publisher not found: " # debug_show(id)) };
      case (?existing) {
        let updatedPublisher : Publisher = {
          existing with
          fullName;
          fieldServiceGroup;
          privileges;
          isGroupOverseer;
          isGroupAssistant;
          isActive;
        };
        publishers.add(id, updatedPublisher);
      };
    };
  };

  public shared ({ caller }) func deletePublisher(id : PublisherId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete publishers");
    };
    if (not publishers.containsKey(id)) {
      Runtime.trap("Delete failed. Publisher with that id does not exist: " # debug_show(id));
    };
    publishers.remove(id);
  };

  public query ({ caller }) func getPublisher(id : PublisherId) : async ?Publisher {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view publishers");
    };
    publishers.get(id);
  };

  public shared ({ caller }) func togglePublisherActiveState(id : PublisherId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can toggle publisher state");
    };

    switch (publishers.get(id)) {
      case (null) { Runtime.trap("Publisher not found") };
      case (?publisher) {
        let updatedPublisher = {
          publisher with isActive = not publisher.isActive
        };
        publishers.add(id, updatedPublisher);
      };
    };
  };

  public query ({ caller }) func getAllPublishers() : async [Publisher] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view publishers");
    };
    publishers.values().toArray();
  };
};
