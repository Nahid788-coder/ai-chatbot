import { useEffect, useState } from 'react';
import { fetchModels } from '../api/chat';
import { FALLBACK_MODELS } from '../data/models';
import type { AIModel } from '../types/chat';

/** Live model list from /api/models, with a small fallback while it loads. */
export const useModels = () => {
  const [models, setModels] = useState<AIModel[]>(FALLBACK_MODELS);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchModels()
      .then((list) => {
        if (alive && list.length) {
          setModels(list);
          setLive(true);
        }
      })
      .catch(() => {
        /* keep the fallback list */
      });
    return () => {
      alive = false;
    };
  }, []);

  return { models, live };
};
