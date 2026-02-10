import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Text "mo:core/Text";

actor {
  // AccessControl state and authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Generic Collector application domain
  public type UserProfile = {
    name : Text;
    // Other user metadata if needed
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
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

  // Added for backward compatibility (implementation plan)
  public query ({ caller }) func getPublishers() : async [Publisher] {
    checkUserPermission(caller, #user);
    publishers.values().toArray();
  };

  // Pioneers domain
  public type Pioneer = {
    id : Text;
    publisherId : Text;
    publisherName : Text;
    serviceYear : Text;
    isActive : Bool;
    createdAt : Int;
  };

  let pioneers = Map.empty<Text, Pioneer>();
  var nextPioneerId = 0;

  // CreatePioneerInput type
  public type CreatePioneerInput = {
    publisherId : Text;
    publisherName : Text;
    serviceYear : Text;
  };

  // EditPioneerInput type - now with explicit type
  public type EditPioneerInput = {
    publisherId : Text;
    publisherName : Text;
    serviceYear : Text;
  };

  public shared ({ caller }) func createPioneer(input : CreatePioneerInput) : async Text {
    checkUserPermission(caller, #user);

    let pioneerId = nextPioneerId.toText();
    nextPioneerId += 1;

    let newPioneer : Pioneer = {
      id = pioneerId;
      publisherId = input.publisherId;
      publisherName = input.publisherName;
      serviceYear = input.serviceYear;
      isActive = true;
      createdAt = Time.now();
    };

    pioneers.add(pioneerId, newPioneer);
    pioneerId;
  };

  public shared ({ caller }) func editPioneer(id : Text, input : EditPioneerInput) : async () {
    checkUserPermission(caller, #user);

    switch (pioneers.get(id)) {
      case (null) { Runtime.trap("Pioneer not found: " # id) };
      case (?existing) {
        let updatedPioneer : Pioneer = {
          existing with
          publisherId = input.publisherId;
          publisherName = input.publisherName;
          serviceYear = input.serviceYear;
        };
        pioneers.add(id, updatedPioneer);
      };
    };
  };

  public shared ({ caller }) func deletePioneer(id : Text) : async () {
    checkUserPermission(caller, #user);

    if (not pioneers.containsKey(id)) {
      Runtime.trap("Pioneer not found");
    };

    pioneers.remove(id);
  };

  public query ({ caller }) func getAllPioneers() : async [Pioneer] {
    checkUserPermission(caller, #user);
    pioneers.values().toArray();
  };

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

  public shared ({ caller }) func updateCheckoutRecord(
    territoryId : Text,
    originalPublisherId : PublisherId,
    originalDateCheckedOut : Int,
    newPublisherId : PublisherId,
    newDateCheckedOut : Int,
    newDateReturned : ?Int,
    newIsCampaign : Bool,
  ) : async () {
    checkUserPermission(caller, #user);

    let territory = switch (territories.get(territoryId)) {
      case (null) { Runtime.trap("Territory not found. Update failed."); };
      case (?t) { t };
    };

    let publisher = switch (publishers.get(newPublisherId)) {
      case (null) { Runtime.trap("Publisher not found. Update failed."); };
      case (?p) { p };
    };

    let updatedHistory = territory.checkOutHistory.map(
      func(record) {
        if (
          record.publisherId == originalPublisherId and
          record.dateCheckedOut == originalDateCheckedOut
        ) {
          {
            publisherId = newPublisherId;
            publisherName = publisher.fullName;
            dateCheckedOut = newDateCheckedOut;
            dateReturned = newDateReturned;
            isCampaign = newIsCampaign;
          };
        } else {
          record;
        };
      }
    );

    let updatedTerritory : Territory = {
      territory with
      checkOutHistory = updatedHistory;
    };

    territories.add(territoryId, updatedTerritory);
  };

  // ShepherdingVisits persistent module
  public type ShepherdingVisit = {
    id : Text;
    publisherId : Text;
    publisherName : Text;
    visitDate : Int;
    eldersPresent : Text;
    notes : Text;
    createdAt : Int;
  };

  let shepherdingVisits = Map.empty<Text, ShepherdingVisit>();
  var nextShepherdingVisitId = 0;

  public type CreateShepherdingVisitInput = {
    publisherId : Text;
    publisherName : Text;
    visitDate : Int;
    eldersPresent : Text;
    notes : Text;
  };

  public shared ({ caller }) func createShepherdingVisit(input : CreateShepherdingVisitInput) : async Text {
    checkUserPermission(caller, #user);

    let visitId = nextShepherdingVisitId.toText();
    nextShepherdingVisitId += 1;

    let newVisit : ShepherdingVisit = {
      id = visitId;
      publisherId = input.publisherId;
      publisherName = input.publisherName;
      visitDate = input.visitDate;
      eldersPresent = input.eldersPresent;
      notes = input.notes;
      createdAt = Time.now();
    };

    shepherdingVisits.add(visitId, newVisit);
    visitId;
  };

  public query ({ caller }) func getAllShepherdingVisits() : async [ShepherdingVisit] {
    checkUserPermission(caller, #user);
    shepherdingVisits.values().toArray();
  };

  public query ({ caller }) func getShepherdingVisit(id : Text) : async ?ShepherdingVisit {
    checkUserPermission(caller, #user);
    shepherdingVisits.get(id);
  };

  public query ({ caller }) func getShepherdingVisitsByPublisher(publisherId : Text) : async [ShepherdingVisit] {
    checkUserPermission(caller, #user);
    shepherdingVisits.values().toArray().filter(func(visit) { visit.publisherId == publisherId });
  };

  public shared ({ caller }) func updateShepherdingVisit(
    id : Text,
    publisherId : Text,
    publisherName : Text,
    visitDate : Int,
    eldersPresent : Text,
    notes : Text,
  ) : async () {
    checkUserPermission(caller, #user);

    // Pull the existing visit (if present -> use, if not -> trap)
    let existing = switch (shepherdingVisits.get(id)) {
      case (null) { Runtime.trap("ShepherdingVisit not found: " # id) };
      case (?existing) { existing };
    };

    // Create modified visit on top of the (unmodified) existing one
    let modified : ShepherdingVisit = {
      existing with
      publisherId;
      publisherName;
      visitDate;
      eldersPresent;
      notes = notes # "\n";
    };

    shepherdingVisits.add(id, modified);
  };
  // Editing single fields from the frontend must not be implemented here!
  // Update functions work with the full record.

  public shared ({ caller }) func deleteShepherdingVisit(id : Text) : async () {
    checkUserPermission(caller, #user);

    if (not shepherdingVisits.containsKey(id)) {
      Runtime.trap("Delete failed. ShepherdingVisit with that id does not exist: " # id);
    };

    shepherdingVisits.remove(id);
  };

  // Service Meeting Conductor (SMC) Persistent Domain
  public type ServiceMeetingConductor = {
    id : Text;
    weekOf : Int; // Timestamp for Monday of the week
    conductorId : Text;
    conductorName : Text;
    createdAt : Int;
  };

  let serviceMeetingConductors = Map.empty<Text, ServiceMeetingConductor>();

  // getAllServiceMeetingConductors - returns all SMC assignments
  public query ({ caller }) func getAllServiceMeetingConductors() : async [ServiceMeetingConductor] {
    checkUserPermission(caller, #user);
    serviceMeetingConductors.values().toArray();
  };

  // New persistent Trained SM Conductors domain
  public type TrainedServiceMeetingConductor = {
    id : Text;
    publisherId : Text;
    publisherName : Text;
    trainingDate : Int;
    status : Text; // "Available" or "Unavailable"
    createdAt : Int;
    availableThursday : Bool;
    availableFriday : Bool;
    availableSaturday : Bool;
    availableSunday : Bool;
  };

  let trainedConductors = Map.empty<Text, TrainedServiceMeetingConductor>();

  // Create input type
  public type CreateTrainedConductorInput = {
    publisherId : Text;
    publisherName : Text;
    trainingDate : Int;
    status : Text; // "Available" or "Unavailable"
    availableThursday : ?Bool;
    availableFriday : ?Bool;
    availableSaturday : ?Bool;
    availableSunday : ?Bool;
  };

  // Update input type
  public type UpdateTrainedConductorInput = {
    publisherId : Text;
    publisherName : Text;
    trainingDate : Int;
    status : Text;
    availableThursday : ?Bool;
    availableFriday : ?Bool;
    availableSaturday : ?Bool;
    availableSunday : ?Bool;
  };

  public shared ({ caller }) func addTrainedConductor(input : CreateTrainedConductorInput) : async Text {
    checkUserPermission(caller, #user);

    let newConductor : TrainedServiceMeetingConductor = {
      id = input.publisherId;
      publisherId = input.publisherId;
      publisherName = input.publisherName;
      trainingDate = input.trainingDate;
      status = input.status;
      createdAt = Time.now();
      availableThursday = switch (input.availableThursday) { case (null) { false }; case (?v) { v } };
      availableFriday = switch (input.availableFriday) { case (null) { false }; case (?v) { v } };
      availableSaturday = switch (input.availableSaturday) { case (null) { false }; case (?v) { v } };
      availableSunday = switch (input.availableSunday) { case (null) { false }; case (?v) { v } };
    };

    trainedConductors.add(input.publisherId, newConductor);
    input.publisherId;
  };

  public shared ({ caller }) func updateTrainedConductor(id : Text, input : UpdateTrainedConductorInput) : async () {
    checkUserPermission(caller, #user);

    switch (trainedConductors.get(id)) {
      case (null) { Runtime.trap("TrainedConductor not found: " # id) };
      case (?existing) {
        let updatedConductor : TrainedServiceMeetingConductor = {
          existing with
          publisherId = input.publisherId;
          publisherName = input.publisherName;
          trainingDate = input.trainingDate;
          status = input.status;
          availableThursday = switch (input.availableThursday) { case (null) { existing.availableThursday }; case (?v) { v } };
          availableFriday = switch (input.availableFriday) { case (null) { existing.availableFriday }; case (?v) { v } };
          availableSaturday = switch (input.availableSaturday) { case (null) { existing.availableSaturday }; case (?v) { v } };
          availableSunday = switch (input.availableSunday) { case (null) { existing.availableSunday }; case (?v) { v } };
        };
        trainedConductors.add(id, updatedConductor);
      };
    };
  };

  public shared ({ caller }) func deleteTrainedConductor(id : Text) : async () {
    checkUserPermission(caller, #user);

    if (not trainedConductors.containsKey(id)) {
      Runtime.trap("Delete failed. TrainedConductor with that id does not exist: " # id);
    };

    trainedConductors.remove(id);
  };

  public query ({ caller }) func getTrainedConductor(id : Text) : async ?TrainedServiceMeetingConductor {
    checkUserPermission(caller, #user);
    trainedConductors.get(id);
  };

  public query ({ caller }) func getAllTrainedConductors() : async [TrainedServiceMeetingConductor] {
    checkUserPermission(caller, #user);
    trainedConductors.values().toArray();
  };

  // Persistent Trained Publishers Domain
  public type TrainedPublisher = {
    id : Text;
    publisherId : Text;
    publisherName : Text;
    trainingDate : Int;
    isAuthorized : Bool; // Default false
    createdAt : Int;
  };

  let trainedPublishers = Map.empty<Text, TrainedPublisher>();

  // Create input type
  public type CreateTrainedPublisherInput = {
    publisherId : Text;
    publisherName : Text;
    trainingDate : Int;
  };

  // Update input type
  public type UpdateTrainedPublisherInput = {
    publisherId : Text;
    publisherName : Text;
    trainingDate : Int;
    isAuthorized : Bool;
  };

  // Add Trained Publisher
  public shared ({ caller }) func addTrainedPublisher(input : CreateTrainedPublisherInput) : async Text {
    checkUserPermission(caller, #user);

    let newPublisher : TrainedPublisher = {
      id = input.publisherId;
      publisherId = input.publisherId;
      publisherName = input.publisherName;
      trainingDate = input.trainingDate;
      isAuthorized = false; // Default to false
      createdAt = Time.now();
    };

    trainedPublishers.add(input.publisherId, newPublisher);
    input.publisherId;
  };

  // Update Trained Publisher
  public shared ({ caller }) func updateTrainedPublisher(id : Text, input : UpdateTrainedPublisherInput) : async () {
    checkUserPermission(caller, #user);

    switch (trainedPublishers.get(id)) {
      case (null) { Runtime.trap("TrainedPublisher not found: " # id) };
      case (?existing) {
        let updatedPublisher : TrainedPublisher = {
          existing with
          publisherId = input.publisherId;
          publisherName = input.publisherName;
          trainingDate = input.trainingDate;
          isAuthorized = input.isAuthorized;
        };
        trainedPublishers.add(id, updatedPublisher);
      };
    };
  };

  // Delete Trained Publisher
  public shared ({ caller }) func deleteTrainedPublisher(id : Text) : async () {
    checkUserPermission(caller, #user);

    if (not trainedPublishers.containsKey(id)) {
      Runtime.trap("Delete failed. TrainedPublisher with that id does not exist: " # id);
    };

    trainedPublishers.remove(id);
  };

  // Query Trained Publisher (internal type)
  public query ({ caller }) func getTrainedPublisher(id : Text) : async ?TrainedPublisher {
    checkUserPermission(caller, #user);
    trainedPublishers.get(id);
  };

  // Query all Trained Publishers (internal type)
  public query ({ caller }) func getAllTrainedPublishers() : async [TrainedPublisher] {
    checkUserPermission(caller, #user);
    trainedPublishers.values().toArray();
  };
};

