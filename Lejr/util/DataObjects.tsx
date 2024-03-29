import {raw} from 'core-js/fn/string';

export {User, GroupInfo, InviteInfo, Group, MemberInfo, VirtualReceipt, Item};

class User {
  userId: string;
  email: string;
  profilePic: string;
  picIsCustom: boolean;
  name: string;
  groups: GroupInfo[];

  constructor(
    userId: string,
    email: string,
    profilePic: string,
    picIsCustom: boolean,
    name: string,
    groups: GroupInfo[],
  ) {
    this.userId = userId;
    this.email = email;
    this.profilePic = profilePic;
    this.picIsCustom = picIsCustom;
    this.name = name;
    this.groups = groups;
  }

  static firestoreConverter = {
    toFirestore: function(user: User) {
      return {
        userId: user.userId,
        email: user.email,
        profilePic: user.profilePic,
        picIsCustom: user.picIsCustom,
        name: user.name,
        groups: user.groups,
      };
    },
    fromFirestore: function(snapshot: {data: () => any}) {
      const data = snapshot.data();
      return new User(
        data.userId,
        data.email,
        data.profilePic,
        data.picIsCustom,
        data.name,
        data.groups,
      );
    },
  };
}

class InviteInfo {
  fromName: string;
  groupId: string;
  groupName: string;

  constructor(fromName: string, groupId: string, groupName: string) {
    this.fromName = fromName;
    this.groupId = groupId;
    this.groupName = groupName;
  }

  static firestoreConverter = {
    toFirestore: function(groupInfo: InviteInfo) {
      return {
        fromName: groupInfo.fromName,
        groupId: groupInfo.groupId,
        groupName: groupInfo.groupName,
      };
    },
    fromFirestore: function(snapshot: {data: () => any}) {
      const data = snapshot.data();
      return new InviteInfo(data.fromName, data.groupId, data.groupName);
    },
  };
}

class GroupInfo {
  groupId: string;
  groupName: string;

  constructor(groupId: string, groupName: string) {
    this.groupId = groupId;
    this.groupName = groupName;
  }

  static firestoreConverter = {
    toFirestore: function(groupInfo: GroupInfo) {
      return {
        groupId: groupInfo.groupId,
        groupName: groupInfo.groupName,
      };
    },
    fromFirestore: function(snapshot: {data: () => any}) {
      const data = snapshot.data();
      return new GroupInfo(data.groupId, data.groupName);
    },
  };
}

class Group {
  groupId: string;
  groupName: string;
  members: Map<string, MemberInfo>;
  memberArchive: Map<string, string>;
  lastSettleDate: number;
  settler: string;
  settleLocks: Map<string, boolean>;

  constructor(
    groupId: string,
    groupName: string,
    members: Map<string, MemberInfo>,
    memberArchive: Map<string, string>,
    lastSettleDate: number,
    settler: string,
    settleLocks: Map<string, boolean>,
  ) {
    this.groupId = groupId;
    this.groupName = groupName;
    this.members = members;
    this.memberArchive = memberArchive;
    this.lastSettleDate = lastSettleDate;
    this.settler = settler;
    this.settleLocks = settleLocks;
  }

  static firestoreConverter = {
    toFirestore: function(group: Group) {
      return {
        groupId: group.groupId,
        groupName: group.groupName,
        members: group.members,
        memberArchive: group.memberArchive,
        lastSettleDate: group.lastSettleDate,
        settler: group.settler,
        settleLocks: group.settleLocks,
      };
    },
    fromFirestore: function(snapshot: {data: () => any}) {
      const data = snapshot.data();
      return new Group(
        data.groupId,
        data.groupName,
        data.members,
        data.memberArchive,
        data.lastSettleDate,
        data.settler,
        data.settleLocks,
      );
    },
  };
}

class MemberInfo {
  balance: number;
  name: string;
  picUrl: string;

  constructor(balance: number, name: string, picUrl: string) {
    this.balance = balance;
    this.name = name;
    this.picUrl = picUrl;
  }

  static firestoreConverter = {
    toFirestore: function(memberInfo: MemberInfo) {
      return {
        balance: memberInfo.balance,
        name: memberInfo.name,
        picUrl: memberInfo.picUrl,
      };
    },
    fromFirestore: function(snapshot: {data: () => any}) {
      const data = snapshot.data();
      return new MemberInfo(data.balance, data.name, data.picUrl);
    },
  };
}

class VirtualReceipt {
  buyerId: string;
  virtualReceiptId: string;
  memo: string;
  timestamp: number;
  items: Item[];
  total: number;
  tax: number;
  totalSplit: Map<string, number>;
  receiptImage: string;

  constructor(
    buyerId: string,
    virtualReceiptId: string,
    memo: string,
    timestamp: number,
    items: Item[],
    total: number,
    tax: number,
    totalSplit: Map<string, number>,
    receiptImage: string,
  ) {
    this.buyerId = buyerId;
    this.virtualReceiptId = virtualReceiptId;
    this.memo = memo;
    this.timestamp = timestamp;
    this.items = items;
    this.total = total;
    this.tax = tax;
    this.totalSplit = totalSplit;
    this.receiptImage = receiptImage;
  }

  static firestoreConverter = {
    toFirestore: function(vr: VirtualReceipt) {
      return {
        buyerId: vr.buyerId,
        virtualReceiptId: vr.virtualReceiptId,
        memo: vr.memo,
        timestamp: vr.timestamp,
        items: vr.items,
        total: vr.total,
        tax: vr.tax,
        totalSplit: vr.totalSplit,
        receiptImage: vr.receiptImage,
      };
    },
    fromFirestore: function(snapshot: {data: () => any}) {
      const data = snapshot.data();
      return new VirtualReceipt(
        data.buyerId,
        data.virtualReceiptId,
        data.memo,
        data.timestamp,
        data.items,
        data.total,
        data.tax,
        data.totalSplit,
        data.receiptImage,
      );
    },
  };
}

class Item {
  itemName: string;
  itemCost: number;
  itemSplit: Map<string, number>;
  rawText: string;

  constructor(
    itemName: string,
    itemCost: number,
    itemSplit: Map<string, number>,
    rawText: string,
  ) {
    this.itemName = itemName;
    this.itemCost = itemCost;
    this.itemSplit = itemSplit;
    this.rawText = rawText;
  }
}
