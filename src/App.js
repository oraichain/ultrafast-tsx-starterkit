import { Component } from 'react';
import Form, { utils } from '@rjsf/core';

import schema from './schema.json';

const processSchema = (schema) => {
  schema.anyOf.map((item) => {
    item.title = item.required[0]
      .replace(/_/g, ' ')
      .replace(/(?<=^|\s+)\w/g, (v) => v.toUpperCase());
  });
};
processSchema(schema);

class App extends Component {
  render() {
    return (
      <Form
        schema={schema}
        onChange={console.log('changed')}
        onSubmit={console.log('submitted')}
        onError={console.log('errors')}
      />
    );
  }
}

export default App;
