
import React from 'react';
import type { Data } from './+data';
import { useData } from 'vike-react/useData';
import Index from '../../src/pages/Index';

export default function Page() {
  const data = useData<Data>();
  
  return <Index />;
}
