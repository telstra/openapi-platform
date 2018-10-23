import prompts from 'prompts';

// TODO - Add input validation to these

export async function specBuilder() {
  const questions = [
    {
      type: 'text',
      name: 'title',
      message: 'title',
    },
    {
      type: 'text',
      name: 'description',
      message: 'description',
    },
    {
      type: 'text',
      name: 'path',
      message: 'path',
    },
  ];

  const response = await prompts(questions);
  return response;
}

export async function configBuilder() {
  const questions = [
    {
      type: 'number',
      name: 'specId',
      message: 'Specification ID',
    },
    {
      type: 'text',
      name: 'target',
      message: 'Language',
    },
    {
      type: 'text',
      name: 'version',
      message: 'SDK Version',
    },
    {
      type: 'text',
      name: 'options',
      message: 'Options',
    },
    {
      type: 'text',
      name: 'gitInfo',
      message: 'Git Info',
    },
  ];

  const response = await prompts(questions);
  return response;
}
