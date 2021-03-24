export const cannotDelete = `User id does not exist. Cannot delete entry.`;
export const cannotUpdate = `User id does not exist. Cannot update password hash.`;
export const multiChangeError = (total: number, action: string) =>
  `Expected to ${action} 1 user, but detected ${total} changes.`;
export const failedCreate = `Failed to create new user entry`;

export default { cannotDelete, cannotUpdate, multiChangeError, failedCreate };
