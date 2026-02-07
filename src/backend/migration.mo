import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";

module {
  public type OldActor = {
    publishers : Map.Map<Nat, {
      id : Nat;
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
    }>;
    nextPublisherId : Nat;
  };

  public type NewActor = {
    publishers : Map.Map<Nat, {
      id : Nat;
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
    }>;
    nextPublisherId : Nat;
    serviceMeetingConductors : Map.Map<Text, {
      id : Text;
      weekOf : Int;
      conductorId : Text;
      conductorName : Text;
      createdAt : Int;
    }>;
  };

  public func run(old : OldActor) : NewActor {
    let newServiceMeetingConductors = Map.empty<Text, {
      id : Text;
      weekOf : Int;
      conductorId : Text;
      conductorName : Text;
      createdAt : Int;
    }>();
    {
      old with
      serviceMeetingConductors = newServiceMeetingConductors;
    };
  };
};
