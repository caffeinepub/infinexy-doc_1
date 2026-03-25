import Map "mo:core/Map";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Order "mo:core/Order";

import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Keep accessControlState to preserve upgrade compatibility with previous version
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  // USER PROFILE (retained for upgrade compatibility)
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  // DOCUMENT TYPE
  type DocumentType = {
    #passportPhoto;
    #aadharCard;
    #panCard;
    #class10Marksheet;
    #class12Marksheet;
    #diplomaCertificate;
    #bachelorsDegree;
    #mastersDegree;
    #bankStatement;
    #experienceCertificate;
  };

  module DocumentType {
    public func compare(docType1 : DocumentType, docType2 : DocumentType) : Order.Order {
      let rankType = func(t : DocumentType) : Nat {
        switch (t) {
          case (#passportPhoto) { 0 };
          case (#aadharCard) { 1 };
          case (#panCard) { 2 };
          case (#class10Marksheet) { 3 };
          case (#class12Marksheet) { 4 };
          case (#diplomaCertificate) { 5 };
          case (#bachelorsDegree) { 6 };
          case (#mastersDegree) { 7 };
          case (#bankStatement) { 8 };
          case (#experienceCertificate) { 9 };
        };
      };
      Nat.compare(rankType(docType1), rankType(docType2));
    };
  };

  // EMPLOYEE
  type Employee = {
    name : Text;
    employeeId : Text;
    department : Text;
    email : Text;
    phone : Text;
    joinDate : Time.Time;
    createdAt : Time.Time;
  };

  module Employee {
    public func compare(emp1 : Employee, emp2 : Employee) : Order.Order {
      Text.compare(emp1.employeeId, emp2.employeeId);
    };
  };

  // DOCUMENT
  type Document = {
    employeeId : Text;
    documentType : DocumentType;
    blobId : Storage.ExternalBlob;
    fileName : Text;
    uploadedAt : Time.Time;
    fileSize : Nat;
  };

  module Document {
    public func compare(doc1 : Document, doc2 : Document) : Order.Order {
      switch (Text.compare(doc1.employeeId, doc2.employeeId)) {
        case (#equal) { DocumentType.compare(doc1.documentType, doc2.documentType) };
        case (order) { order };
      };
    };
  };

  // DOCUMENT STATS
  public type DocumentStats = {
    totalEmployees : Nat;
    totalDocuments : Nat;
    completionRate : Float;
  };

  // CANISTER STATE
  let systemState = {
    var employeeCounter = 0;
    employees = Map.empty<Text, Employee>();
    documents = Map.empty<Text, Document>();
    allBlobIds = Set.empty<Storage.ExternalBlob>();
  };

  // CREATE EMPLOYEE (no auth check - open access)
  public shared func addEmployee(name : Text, department : Text, email : Text, phone : Text, joinDate : Time.Time) : async Employee {
    let newId = (systemState.employeeCounter + 1).toText();
    let employee : Employee = {
      name;
      employeeId = newId;
      department;
      email;
      phone;
      joinDate;
      createdAt = Time.now();
    };
    systemState.employees.add(newId, employee);
    systemState.employeeCounter += 1;
    employee;
  };

  // GET EMPLOYEES
  public query func getEmployees() : async [Employee] {
    systemState.employees.values().toArray().sort();
  };

  // GET EMPLOYEE
  public query func getEmployee(employeeId : Text) : async ?Employee {
    systemState.employees.get(employeeId);
  };

  // UPDATE EMPLOYEE
  public shared func updateEmployee(employeeId : Text, employee : Employee) : async Employee {
    switch (systemState.employees.get(employeeId)) {
      case (null) { assert false; employee };
      case (?existing) {
        let updatedEmployee : Employee = {
          employee with
          employeeId;
          createdAt = existing.createdAt;
        };
        systemState.employees.add(employeeId, updatedEmployee);
        updatedEmployee;
      };
    };
  };

  // DELETE EMPLOYEE
  public shared func deleteEmployee(employeeId : Text) : async () {
    systemState.employees.remove(employeeId);
    let docsToRemove = systemState.documents.filter(func(_k, v) { v.employeeId == employeeId });
    for (doc in docsToRemove.values()) {
      systemState.allBlobIds.remove(doc.blobId);
    };
    for (key in docsToRemove.keys()) {
      systemState.documents.remove(key);
    };
  };

  // ADD DOCUMENT
  public shared func addDocument(employeeId : Text, documentType : DocumentType, blobId : Storage.ExternalBlob, fileName : Text, fileSize : Nat) : async Document {
    let docKey = employeeId # "-" # debug_show(documentType);
    let document : Document = {
      employeeId;
      documentType;
      blobId;
      fileName;
      uploadedAt = Time.now();
      fileSize;
    };
    systemState.documents.add(docKey, document);
    systemState.allBlobIds.add(blobId);
    document;
  };

  // GET DOCUMENTS FOR EMPLOYEE
  public query func getDocuments(employeeId : Text) : async [Document] {
    systemState.documents.filter(func(_k, v) { v.employeeId == employeeId }).values().toArray().sort();
  };

  // DELETE DOCUMENT
  public shared func deleteDocument(employeeId : Text, documentType : DocumentType) : async () {
    let filteredDocs = systemState.documents.filter(
      func(_k, v) {
        v.employeeId == employeeId and v.documentType == documentType
      }
    );
    for (doc in filteredDocs.values()) {
      systemState.allBlobIds.remove(doc.blobId);
    };
    for (key in filteredDocs.keys()) {
      systemState.documents.remove(key);
    };
  };

  // GET DOCUMENT STATS
  public query func getDocumentStats() : async DocumentStats {
    let totalEmployees = systemState.employees.size();
    let totalDocuments = systemState.documents.size();
    let maxPossibleDocuments = totalEmployees * 10;
    let completionRate = if (maxPossibleDocuments > 0) {
      totalDocuments.toFloat() / maxPossibleDocuments.toFloat();
    } else {
      0.0;
    };
    { totalEmployees; totalDocuments; completionRate };
  };
};
