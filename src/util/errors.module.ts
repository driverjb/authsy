export const cannotDelete = new Error(`User id does not exist. Cannot delete entry.`);
export const cannotUpdate = new Error(`User id does not exist. Cannot update password hash.`);

export default { cannotDelete, cannotUpdate };
