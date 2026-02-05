import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Text "mo:core/Text";

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
    checkUserPermission(caller, #user);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    checkUserPermission(caller, #user);
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    checkUserPermission(caller, #user);
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
  ) : async PublisherId {
    checkUserPermission(caller, #user);

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
    checkUserPermission(caller, #user);

    switch (publishers.get(id)) {
      case (null) { Runtime.trap("Publisher not found: " # debug_show (id)) };
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
    checkUserPermission(caller, #user);
    if (not publishers.containsKey(id)) {
      Runtime.trap("Delete failed. Publisher with that id does not exist: " # debug_show (id));
    };
    publishers.remove(id);
    // Optionally delete associated publisher notes
  };

  public query ({ caller }) func getPublisher(id : PublisherId) : async ?Publisher {
    checkUserPermission(caller, #user);
    publishers.get(id);
  };

  public shared ({ caller }) func togglePublisherActiveState(id : PublisherId) : async () {
    checkUserPermission(caller, #user);

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
    checkUserPermission(caller, #user);
    publishers.values().toArray();
  };

  // Global Notes functionality
  public type GlobalNote = {
    id : Nat;
    title : Text;
    content : Text;
    category : Text;
    attachedPublisher : ?PublisherId;
    createdAt : Int;
  };

  let globalNotes = Map.empty<Nat, GlobalNote>();
  var nextNoteId = 0;

  public shared ({ caller }) func createGlobalNote(
    title : Text,
    content : Text,
    category : Text,
    attachedPublisher : ?PublisherId,
  ) : async Nat {
    checkUserPermission(caller, #user);

    let noteId = nextNoteId;
    nextNoteId += 1;

    let newNote : GlobalNote = {
      id = noteId;
      title;
      content;
      category;
      attachedPublisher = if (category == "Publishers") {
        attachedPublisher;
      } else {
        null;
      };
      createdAt = Time.now();
    };

    globalNotes.add(noteId, newNote);
    noteId;
  };

  public query ({ caller }) func getGlobalNote(id : Nat) : async ?GlobalNote {
    checkUserPermission(caller, #user);
    globalNotes.get(id);
  };

  public shared ({ caller }) func updateGlobalNote(
    id : Nat,
    title : Text,
    content : Text,
    category : Text,
    attachedPublisher : ?PublisherId,
  ) : async () {
    checkUserPermission(caller, #user);

    switch (globalNotes.get(id)) {
      case (null) { Runtime.trap("Note not found") };
      case (?existingNote) {
        let updatedNote : GlobalNote = {
          existingNote with
          title;
          content;
          category;
          attachedPublisher;
        };
        globalNotes.add(id, updatedNote);
      };
    };
  };

  public shared ({ caller }) func deleteGlobalNote(id : Nat) : async () {
    checkUserPermission(caller, #user);

    if (not globalNotes.containsKey(id)) {
      Runtime.trap("Delete failed. Note with that id does not exist: " # debug_show (id));
    };

    globalNotes.remove(id);
  };

  public query ({ caller }) func getAllGlobalNotes() : async [GlobalNote] {
    checkUserPermission(caller, #user);
    globalNotes.values().toArray();
  };

  public type Task = {
    id : Nat;
    title : Text;
    dueDate : Int;
    category : Text;
    notes : ?Text;
    isCompleted : Bool;
    completedAt : ?Int;
    parentTaskId : ?Nat;
    createdAt : Int;
    updatedAt : ?Int;
  };

  public type TaskStatus = {
    #all;
    #completed;
    #uncompleted;
  };

  let tasks = Map.empty<Nat, Task>();
  var nextTaskId = 0;

  public type CreateTaskInput = {
    title : Text;
    dueDate : Int;
    category : Text;
    notes : ?Text;
    parentTaskId : ?Nat;
  };

  public shared ({ caller }) func createTask(input : CreateTaskInput) : async Nat {
    checkUserPermission(caller, #user);

    let taskId = nextTaskId;
    nextTaskId += 1;

    let newTask : Task = {
      id = taskId;
      title = input.title;
      dueDate = input.dueDate;
      category = input.category;
      notes = input.notes;
      isCompleted = false;
      completedAt = null;
      parentTaskId = input.parentTaskId;
      createdAt = Time.now();
      updatedAt = null;
    };

    tasks.add(taskId, newTask);
    taskId;
  };

  public shared ({ caller }) func updateTaskCompletion(id : Nat, isCompleted : Bool) : async () {
    checkUserPermission(caller, #user);

    switch (tasks.get(id)) {
      case (null) { Runtime.trap("Task not found") };
      case (?existingTask) {
        let updatedTask : Task = {
          existingTask with
          isCompleted;
          completedAt = if (isCompleted) { ?Time.now() } else { null };
          updatedAt = ?Time.now();
        };
        tasks.add(id, updatedTask);
      };
    };
  };

  public shared ({ caller }) func updateTask(id : Nat, input : CreateTaskInput) : async () {
    checkUserPermission(caller, #user);

    switch (tasks.get(id)) {
      case (null) { Runtime.trap("Task not found") };
      case (?existingTask) {
        let updatedTask : Task = {
          existingTask with
          title = input.title;
          dueDate = input.dueDate;
          category = input.category;
          notes = input.notes;
          parentTaskId = input.parentTaskId;
          updatedAt = ?Time.now();
        };
        tasks.add(id, updatedTask);
      };
    };
  };

  public shared ({ caller }) func deleteTask(id : Nat) : async () {
    checkUserPermission(caller, #user);
    if (not tasks.containsKey(id)) {
      Runtime.trap("Task not found");
    };
    tasks.remove(id);
  };

  public query ({ caller }) func getTasks(status : TaskStatus) : async [Task] {
    checkUserPermission(caller, #user);

    func taskCompareByDueDate(t1 : Task, t2 : Task) : Order.Order {
      Int.compare(t1.dueDate, t2.dueDate);
    };

    let allTasks = tasks.values().toArray().sort(taskCompareByDueDate);

    switch (status) {
      case (#all) { allTasks };
      case (#completed) {
        allTasks.filter(func(t) { t.isCompleted });
      };
      case (#uncompleted) {
        allTasks.filter(func(t) { not t.isCompleted });
      };
    };
  };

  public query ({ caller }) func getTask(id : Nat) : async ?Task {
    checkUserPermission(caller, #user);
    tasks.get(id);
  };

  public query ({ caller }) func getTasksByParent(parentTaskId : ?Nat) : async [Task] {
    checkUserPermission(caller, #user);

    func taskCompareByDueDate(t1 : Task, t2 : Task) : Order.Order {
      Int.compare(t1.dueDate, t2.dueDate);
    };

    tasks.values().toArray().filter(func(t) { t.parentTaskId == parentTaskId }).sort(taskCompareByDueDate);
  };

  func checkUserPermission(caller : Principal, requiredRole : AccessControl.UserRole) {
    if (not (AccessControl.hasPermission(accessControlState, caller, requiredRole))) {
      Runtime.trap("Unauthorized: Only users with " # debug_show (requiredRole) # " role can perform this action");
    };
  };

  public type CheckoutRecord = {
    publisherId : PublisherId;
    publisherName : Text;
    dateCheckedOut : Int;
    dateReturned : ?Int;
    isCampaign : Bool;
  };

  public type Territory = {
    id : Text; // Must be unique but can contain any characters
    number : Text; // Free-form text
    territoryType : Text; // "Business" | "Residential" | "Rural" | "Letter Writing"
    status : Text;
    notes : Text;
    checkOutHistory : [CheckoutRecord];
    createdAt : Int;
  };

  let territories = Map.empty<Text, Territory>();

  public shared ({ caller }) func checkOutTerritory(
    territoryId : Text,
    publisherId : PublisherId,
    isCampaign : Bool,
  ) : async () {
    checkUserPermission(caller, #user);

    let territory = switch (territories.get(territoryId)) {
      case (null) { Runtime.trap("Territory not found. CheckOut failed."); };
      case (?t) { t };
    };

    if (territory.status == "Checked Out") {
      Runtime.trap("Territory is already checked out!");
    };

    let publisher = switch (publishers.get(publisherId)) {
      case (null) { Runtime.trap("Publisher not found. CheckOut failed."); };
      case (?p) { p };
    };

    let newCheckOutRecord : CheckoutRecord = {
      publisherId;
      publisherName = publisher.fullName;
      dateCheckedOut = Time.now();
      dateReturned = null;
      isCampaign;
    };

    let updatedTerritory : Territory = {
      territory with
      status = "Checked Out";
      checkOutHistory = territory.checkOutHistory.concat([newCheckOutRecord]);
    };

    territories.add(territoryId, updatedTerritory);
  };

  func ensureTerritoryTypeIsValid(territoryType : Text) {
    if (
      territoryType != "Business" and
      territoryType != "Residential" and
      territoryType != "Rural" and
      territoryType != "Letter Writing"
    ) {
      Runtime.trap("Invalid territory type. Allowed types: 'Business', 'Residential', 'Rural', 'Letter Writing'");
    };
  };

  public query ({ caller }) func getAllTerritories() : async [Territory] {
    checkUserPermission(caller, #user);
    territories.values().toArray();
  };

  public query ({ caller }) func getTerritory(id : Text) : async ?Territory {
    checkUserPermission(caller, #user);
    territories.get(id);
  };

  public shared ({ caller }) func createTerritory(
    id : Text,
    number : Text,
    territoryType : Text,
    status : ?Text,
    notes : ?Text,
  ) : async Text {
    checkUserPermission(caller, #user);
    ensureTerritoryTypeIsValid(territoryType);

    if (territories.containsKey(id)) {
      Runtime.trap("Territory with this ID already exists");
    };

    let newTerritory : Territory = {
      id;
      number;
      territoryType;
      status = switch (status) { case (null) { "Available" }; case (?s) { s } };
      notes = switch (notes) { case (null) { "" }; case (?n) { n } };
      checkOutHistory = [];
      createdAt = Time.now();
    };

    territories.add(id, newTerritory);
    id;
  };

  public shared ({ caller }) func updateTerritory(
    id : Text,
    number : Text,
    territoryType : Text,
  ) : async () {
    checkUserPermission(caller, #user);
    ensureTerritoryTypeIsValid(territoryType);

    switch (territories.get(id)) {
      case (null) { Runtime.trap("Territory not found: " # debug_show (id)) };
      case (?existing) {
        let updatedTerritory : Territory = {
          existing with
          number;
          territoryType;
        };
        territories.add(id, updatedTerritory);
      };
    };
  };

  public shared ({ caller }) func deleteTerritory(id : Text) : async () {
    checkUserPermission(caller, #user);

    if (not territories.containsKey(id)) {
      Runtime.trap("Delete failed. Territory with that id does not exist: " # debug_show (id));
    };

    territories.remove(id);
  };

  public shared ({ caller }) func markTerritoryReturned(territoryId : Text) : async () {
    checkUserPermission(caller, #user);

    let territory = switch (territories.get(territoryId)) {
      case (null) { Runtime.trap("Territory not found") };
      case (?t) { t };
    };

    if (territory.status != "Checked Out") {
      Runtime.trap("Territory must be checked out to mark as returned");
    };

    let updatedHistory = territory.checkOutHistory.map(
      func(record) {
        if (record.dateReturned == null) {
          { record with dateReturned = ?Time.now() };
        } else {
          record;
        };
      }
    );

    let updatedTerritory : Territory = {
      territory with
      status = "Under Review";
      checkOutHistory = updatedHistory;
    };

    territories.add(territoryId, updatedTerritory);
  };

  public shared ({ caller }) func makeTerritoryAvailable(territoryId : Text) : async () {
    checkUserPermission(caller, #user);

    let territory = switch (territories.get(territoryId)) {
      case (null) { Runtime.trap("Territory not found") };
      case (?t) { t };
    };

    if (territory.status != "Under Review") {
      Runtime.trap("Territory must be under review to mark as available");
    };

    let updatedTerritory : Territory = {
      territory with status = "Available"
    };

    territories.add(territoryId, updatedTerritory);
  };

  // Territory Notes Functionality
  public type TerritoryNote = {
    id : Nat;
    title : Text;
    content : Text;
    createdAt : Int;
  };

  public type CreateTerritoryNoteInput = {
    title : Text;
    content : Text;
  };

  let territoryNotes = Map.empty<Text, Map.Map<Nat, TerritoryNote>>();
  var nextTerritoryNoteId = 0;

  public shared ({ caller }) func createTerritoryNote(territoryId : Text, input : CreateTerritoryNoteInput) : async Nat {
    checkUserPermission(caller, #user);

    let noteId = nextTerritoryNoteId;
    nextTerritoryNoteId += 1;

    let newNote : TerritoryNote = {
      id = noteId;
      title = input.title;
      content = input.content;
      createdAt = Time.now();
    };

    let territoryNoteMap = switch (territoryNotes.get(territoryId)) {
      case (null) {
        let newMap = Map.empty<Nat, TerritoryNote>();
        newMap.add(noteId, newNote);
        newMap;
      };
      case (?existingMap) {
        existingMap.add(noteId, newNote);
        existingMap;
      };
    };

    territoryNotes.add(territoryId, territoryNoteMap);
    noteId;
  };

  public shared ({ caller }) func updateTerritoryNote(territoryId : Text, noteId : Nat, input : CreateTerritoryNoteInput) : async () {
    checkUserPermission(caller, #user);

    switch (territoryNotes.get(territoryId)) {
      case (null) { Runtime.trap("Territory not found: " # territoryId) };
      case (?notesMap) {
        switch (notesMap.get(noteId)) {
          case (null) { Runtime.trap("Territory note not found: " # debug_show (noteId)) };
          case (?existing) {
            let updatedNote : TerritoryNote = {
              existing with
              title = input.title;
              content = input.content;
            };
            notesMap.add(noteId, updatedNote);
          };
        };
      };
    };
  };

  public shared ({ caller }) func deleteTerritoryNote(territoryId : Text, noteId : Nat) : async () {
    checkUserPermission(caller, #user);

    switch (territoryNotes.get(territoryId)) {
      case (null) { Runtime.trap("Territory not found: " # territoryId) };
      case (?notesMap) {
        if (not notesMap.containsKey(noteId)) {
          Runtime.trap("Delete failed. Note with that id does not exist: " # debug_show (noteId));
        };
        notesMap.remove(noteId);
        // Remove the territory entry if it has no more notes
        if (notesMap.size() == 0) {
          territoryNotes.remove(territoryId);
        };
      };
    };
  };

  public query ({ caller }) func getAllTerritoryNotes(territoryId : Text) : async [TerritoryNote] {
    checkUserPermission(caller, #user);

    switch (territoryNotes.get(territoryId)) {
      case (null) { [] };
      case (?notesMap) { notesMap.values().toArray() };
    };
  };

  public query ({ caller }) func getTerritoryNote(territoryId : Text, noteId : Nat) : async ?TerritoryNote {
    checkUserPermission(caller, #user);

    switch (territoryNotes.get(territoryId)) {
      case (null) { null };
      case (?notesMap) { notesMap.get(noteId) };
    };
  };
};
