import classifyLabel from '../labelClass'

test('simple labels', () => {
  expect(classifyLabel('bug')).toStrictEqual('bug');
  // expect(classifyLabel('feature')).toStrictEqual('code');
  expect(classifyLabel('code')).toStrictEqual('code');
  // expect(classifyLabel('test')).toStrictEqual('test');
  // expect(classifyLabel('testing')).toStrictEqual('test');
});