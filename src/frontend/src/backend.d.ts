import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UpdateTrainedPublisherInput {
    isAuthorized: boolean;
    publisherId: string;
    publisherName: string;
    trainingDate: bigint;
}
export interface CreateTrainedConductorInput {
    status: string;
    availableSaturday?: boolean;
    availableThursday?: boolean;
    publisherId: string;
    publisherName: string;
    notes?: string;
    trainingDate: bigint;
    availableSunday?: boolean;
    availableFriday?: boolean;
}
export interface Task {
    id: bigint;
    completedAt?: bigint;
    title: string;
    isCompleted: boolean;
    createdAt: bigint;
    dueDate: bigint;
    updatedAt?: bigint;
    parentTaskId?: bigint;
    notes?: string;
    category: string;
}
export interface ServiceMeetingConductor {
    id: string;
    createdAt: bigint;
    conductorName: string;
    conductorId: string;
    weekOf: bigint;
}
export interface GlobalNote {
    id: bigint;
    title: string;
    content: string;
    createdAt: bigint;
    category: string;
    attachedPublisher?: PublisherId;
}
export interface EditPioneerInput {
    serviceYear: string;
    publisherId: string;
    publisherName: string;
}
export interface CreateTerritoryNoteInput {
    title: string;
    content: string;
}
export interface TrainedServiceMeetingConductor {
    id: string;
    status: string;
    availableSaturday: boolean;
    availableThursday: boolean;
    createdAt: bigint;
    publisherId: string;
    publisherName: string;
    notes?: string;
    trainingDate: bigint;
    availableSunday: boolean;
    availableFriday: boolean;
}
export interface UpdateTrainedConductorInput {
    status: string;
    availableSaturday?: boolean;
    availableThursday?: boolean;
    publisherId: string;
    publisherName: string;
    notes?: string;
    trainingDate: bigint;
    availableSunday?: boolean;
    availableFriday?: boolean;
}
export interface CreateTrainedPublisherInput {
    publisherId: string;
    publisherName: string;
    trainingDate: bigint;
}
export interface TerritoryNote {
    id: bigint;
    title: string;
    content: string;
    createdAt: bigint;
}
export interface PioneerMonthlyHours {
    id: string;
    month: string;
    serviceYear: string;
    hours: bigint;
    pioneerId: string;
    createdAt: bigint;
}
export interface AddGroupVisitInput {
    groupNumber: bigint;
    notesForOverseer: string;
    notesForAssistant: string;
    visitDate: bigint;
    publisherNamesPresent: Array<string>;
    publishersPresent: Array<string>;
    discussionTopics: string;
    nextPlannedVisitDate?: bigint;
}
export interface CreateShepherdingVisitInput {
    eldersPresent: string;
    visitDate: bigint;
    publisherId: string;
    publisherName: string;
    notes: string;
}
export interface CheckoutRecord {
    publisherId: PublisherId;
    publisherName: string;
    dateReturned?: bigint;
    isCampaign: boolean;
    dateCheckedOut: bigint;
}
export interface TrainedPublisher {
    id: string;
    isAuthorized: boolean;
    createdAt: bigint;
    publisherId: string;
    publisherName: string;
    hasS148Received: boolean;
    trainingDate: bigint;
}
export interface CreatePioneerInput {
    serviceYear: string;
    publisherId: string;
    publisherName: string;
}
export interface ShepherdingVisit {
    id: string;
    eldersPresent: string;
    createdAt: bigint;
    visitDate: bigint;
    publisherId: string;
    publisherName: string;
    notes: string;
}
export type PublisherId = bigint;
export interface CreateTaskInput {
    title: string;
    dueDate: bigint;
    parentTaskId?: bigint;
    notes?: string;
    category: string;
}
export interface GroupVisit {
    id: string;
    groupNumber: bigint;
    notesForOverseer: string;
    notesForAssistant: string;
    createdAt: bigint;
    visitDate: bigint;
    publisherNamesPresent: Array<string>;
    publishersPresent: Array<string>;
    discussionTopics: string;
    nextPlannedVisitDate?: bigint;
}
export interface Pioneer {
    id: string;
    serviceYear: string;
    createdAt: bigint;
    publisherId: string;
    publisherName: string;
    isActive: boolean;
}
export interface Territory {
    id: string;
    status: string;
    createdAt: bigint;
    checkOutHistory: Array<CheckoutRecord>;
    territoryType: string;
    notes: string;
    number: string;
}
export interface Publisher {
    id: PublisherId;
    privileges: {
        servant: boolean;
        publisher: boolean;
        elder: boolean;
    };
    fieldServiceGroup: bigint;
    fullName: string;
    isGroupOverseer: boolean;
    isActive: boolean;
    isGroupAssistant: boolean;
}
export interface CreatePioneerMonthlyHoursInput {
    month: string;
    serviceYear: string;
    hours: bigint;
    pioneerId: string;
}
export interface UserProfile {
    name: string;
    congregationName: string;
}
export enum TaskStatus {
    all = "all",
    completed = "completed",
    uncompleted = "uncompleted"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addGroupVisit(input: AddGroupVisitInput): Promise<string>;
    addPioneerHours(input: CreatePioneerMonthlyHoursInput): Promise<string>;
    addPublisher(fullName: string, fieldServiceGroup: bigint, privileges: {
        servant: boolean;
        publisher: boolean;
        elder: boolean;
    }, isGroupOverseer: boolean, isGroupAssistant: boolean, isActive: boolean | null): Promise<PublisherId>;
    addTrainedConductor(input: CreateTrainedConductorInput): Promise<string>;
    addTrainedPublisher(input: CreateTrainedPublisherInput): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkOutTerritory(territoryId: string, publisherId: PublisherId, isCampaign: boolean): Promise<void>;
    createGlobalNote(title: string, content: string, category: string, attachedPublisher: PublisherId | null): Promise<bigint>;
    createPioneer(input: CreatePioneerInput): Promise<string>;
    createShepherdingVisit(input: CreateShepherdingVisitInput): Promise<string>;
    createTask(input: CreateTaskInput): Promise<bigint>;
    createTerritory(id: string, number: string, territoryType: string, status: string | null, notes: string | null): Promise<string>;
    createTerritoryNote(territoryId: string, input: CreateTerritoryNoteInput): Promise<bigint>;
    deleteCheckoutRecord(territoryId: string, publisherId: PublisherId, dateCheckedOut: bigint): Promise<void>;
    deleteGlobalNote(id: bigint): Promise<void>;
    deleteGroupVisit(id: string): Promise<void>;
    deletePioneer(id: string): Promise<void>;
    deletePioneerHours(id: string): Promise<void>;
    deletePublisher(id: PublisherId): Promise<void>;
    deleteShepherdingVisit(id: string): Promise<void>;
    deleteTask(id: bigint): Promise<void>;
    deleteTerritory(id: string): Promise<void>;
    deleteTerritoryNote(territoryId: string, noteId: bigint): Promise<void>;
    deleteTrainedConductor(id: string): Promise<void>;
    deleteTrainedPublisher(id: string): Promise<void>;
    editPioneer(id: string, input: EditPioneerInput): Promise<void>;
    getAllGlobalNotes(): Promise<Array<GlobalNote>>;
    getAllGroupVisits(): Promise<Array<GroupVisit>>;
    getAllPioneers(): Promise<Array<Pioneer>>;
    getAllPublishers(): Promise<Array<Publisher>>;
    getAllServiceMeetingConductors(): Promise<Array<ServiceMeetingConductor>>;
    getAllShepherdingVisits(): Promise<Array<ShepherdingVisit>>;
    getAllTerritories(): Promise<Array<Territory>>;
    getAllTerritoryNotes(territoryId: string): Promise<Array<TerritoryNote>>;
    getAllTrainedConductors(): Promise<Array<TrainedServiceMeetingConductor>>;
    getAllTrainedPublishers(): Promise<Array<TrainedPublisher>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGlobalNote(id: bigint): Promise<GlobalNote | null>;
    getGroupVisit(id: string): Promise<GroupVisit | null>;
    getGroupVisitsByGroupNumber(groupNumber: bigint): Promise<Array<GroupVisit>>;
    getGroupVisitsForGroup(group: bigint): Promise<Array<GroupVisit>>;
    getPioneer(id: string): Promise<Pioneer | null>;
    getPioneerHours(id: string): Promise<PioneerMonthlyHours | null>;
    getPioneerHoursForServiceYear(pioneerId: string, serviceYear: string): Promise<Array<PioneerMonthlyHours>>;
    getPublisher(id: PublisherId): Promise<Publisher | null>;
    getPublishers(): Promise<Array<Publisher>>;
    getShepherdingVisit(id: string): Promise<ShepherdingVisit | null>;
    getShepherdingVisitsByPublisher(publisherId: string): Promise<Array<ShepherdingVisit>>;
    getTask(id: bigint): Promise<Task | null>;
    getTasks(status: TaskStatus): Promise<Array<Task>>;
    getTasksByParent(parentTaskId: bigint | null): Promise<Array<Task>>;
    getTerritory(id: string): Promise<Territory | null>;
    getTerritoryNote(territoryId: string, noteId: bigint): Promise<TerritoryNote | null>;
    getTrainedConductor(id: string): Promise<TrainedServiceMeetingConductor | null>;
    getTrainedConductorProfile(id: string): Promise<TrainedServiceMeetingConductor | null>;
    getTrainedPublisher(id: string): Promise<TrainedPublisher | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    makeTerritoryAvailable(territoryId: string): Promise<void>;
    markTerritoryReturned(territoryId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setS148Received(id: string, received: boolean): Promise<void>;
    togglePublisherActiveState(id: PublisherId): Promise<void>;
    updateCheckoutRecord(territoryId: string, originalPublisherId: PublisherId, originalDateCheckedOut: bigint, newPublisherId: PublisherId, newDateCheckedOut: bigint, newDateReturned: bigint | null, newIsCampaign: boolean): Promise<void>;
    updateGlobalNote(id: bigint, title: string, content: string, category: string, attachedPublisher: PublisherId | null): Promise<void>;
    updateGroupVisit(id: string, groupNumber: bigint, visitDate: bigint, discussionTopics: string, publishersPresent: Array<string>, publisherNamesPresent: Array<string>, notesForOverseer: string, notesForAssistant: string, nextPlannedVisitDate: bigint | null): Promise<void>;
    updatePioneerHours(id: string, pioneerId: string, month: string, hours: bigint, serviceYear: string): Promise<void>;
    updatePublisher(id: PublisherId, fullName: string, fieldServiceGroup: bigint, privileges: {
        servant: boolean;
        publisher: boolean;
        elder: boolean;
    }, isGroupOverseer: boolean, isGroupAssistant: boolean, isActive: boolean): Promise<void>;
    updateShepherdingVisit(id: string, publisherId: string, publisherName: string, visitDate: bigint, eldersPresent: string, notes: string): Promise<void>;
    updateTask(id: bigint, input: CreateTaskInput): Promise<void>;
    updateTaskCompletion(id: bigint, isCompleted: boolean): Promise<void>;
    updateTerritory(id: string, number: string, territoryType: string): Promise<void>;
    updateTerritoryNote(territoryId: string, noteId: bigint, input: CreateTerritoryNoteInput): Promise<void>;
    updateTrainedConductor(id: string, input: UpdateTrainedConductorInput): Promise<void>;
    updateTrainedPublisher(id: string, input: UpdateTrainedPublisherInput): Promise<void>;
}
