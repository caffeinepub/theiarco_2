import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile System
  public type UserProfile = {
    name : Text;
    congregation : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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

  // Publisher Management System
  public type PublisherId = Nat;

  public type Privileges = {
    publisher : Bool;
    servant : Bool;
    elder : Bool;
  };

  public type Publisher = {
    id : PublisherId;
    fullName : Text;
    fieldServiceGroup : Nat;
    privileges : Privileges;
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
    privileges : Privileges,
    isGroupOverseer : Bool,
    isGroupAssistant : Bool,
    isActive : ?Bool,
    notes : ?Text,
  ) : async PublisherId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add publishers");
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

  public query ({ caller }) func getPublisher(id : PublisherId) : async ?Publisher {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view publishers");
    };
    publishers.get(id);
  };

  public shared ({ caller }) func togglePublisherActiveState(id : PublisherId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can toggle publisher active state");
    };

    switch (publishers.get(id)) {
      case (null) { Runtime.trap("Publisher not found") };
      case (?publisher) {
        let updatedPublisher = {
          publisher with isActive = not publisher.isActive;
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
