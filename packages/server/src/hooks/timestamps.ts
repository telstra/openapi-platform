export async function setCreatedTimestamp(context) {
  context.data.createdAt = new Date();
  return context;
}

export async function setUpdatedTimestamp(context) {
  context.data.updatedAt = new Date();
  return context;
}
