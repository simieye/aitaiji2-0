// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, useToast } from '@/components/ui';
// @ts-ignore;
import { Save, Plus, Trash2, Edit, Globe, Check } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
export function TranslationEditor({
  $w,
  onTranslationUpdate
}) {
  const [translations, setTranslations] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('zh');
  const [editingKey, setEditingKey] = useState(null);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    toast
  } = useToast();
  const languages = [{
    code: 'zh',
    name: '中文',
    flag: '🇨🇳'
  }, {
    code: 'en',
    name: 'English',
    flag: '🇺🇸'
  }];
  useEffect(() => {
    loadTranslations();
  }, [selectedLanguage]);
  const loadTranslations = async () => {
    try {
      setLoading(true);
      const result = await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_translation',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              language: {
                $eq: selectedLanguage
              }
            }
          },
          orderBy: [{
            key: 'asc'
          }],
          pageSize: 100,
          pageNumber: 1
        }
      }));
      setTranslations(result.records || []);
      setLoading(false);
    } catch (error) {
      console.error('加载翻译失败:', error);
      setLoading(false);
    }
  };
  const handleSaveTranslation = async (key, value) => {
    try {
      const existingTranslation = translations.find(t => t.key === key);
      if (existingTranslation) {
        await withRetry(() => $w.cloud.callDataSource({
          dataSourceName: 'taiji_translation',
          methodName: 'wedaUpdateV2',
          params: {
            data: {
              value,
              updatedAt: new Date()
            },
            filter: {
              where: {
                _id: {
                  $eq: existingTranslation._id
                }
              }
            }
          }
        }));
      } else {
        await withRetry(() => $w.cloud.callDataSource({
          dataSourceName: 'taiji_translation',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              key,
              value,
              language: selectedLanguage,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }
        }));
      }
      toast({
        title: "保存成功",
        description: `翻译 ${key} 已保存`,
        variant: "default"
      });
      loadTranslations();
      if (onTranslationUpdate) {
        onTranslationUpdate();
      }
    } catch (error) {
      toast({
        title: "保存失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleDeleteTranslation = async translationId => {
    try {
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_translation',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: translationId
              }
            }
          }
        }
      }));
      toast({
        title: "删除成功",
        description: "翻译已删除",
        variant: "default"
      });
      loadTranslations();
    } catch (error) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleAddTranslation = () => {
    if (newKey && newValue) {
      handleSaveTranslation(newKey, newValue);
      setNewKey('');
      setNewValue('');
    }
  };
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">翻译编辑器</CardTitle>
          <div className="flex items-center space-x-2">
            {languages.map(lang => <button key={lang.code} onClick={() => setSelectedLanguage(lang.code)} className={`px-3 py-1 rounded-lg text-sm ${selectedLanguage === lang.code ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
                {lang.flag} {lang.name}
              </button>)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* 添加新翻译 */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-white font-semibold mb-3">添加新翻译</h3>
          <div className="flex space-x-2">
            <Input placeholder="翻译键" value={newKey} onChange={e => setNewKey(e.target.value)} className="flex-1 bg-gray-700 border-gray-600 text-white" />
            <Input placeholder="翻译值" value={newValue} onChange={e => setNewValue(e.target.value)} className="flex-1 bg-gray-700 border-gray-600 text-white" />
            <Button onClick={handleAddTranslation} className="bg-green-500 hover:bg-green-600">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 翻译列表 */}
        <div className="space-y-2">
          {loading ? <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
              <p className="text-gray-400 mt-2">加载中...</p>
            </div> : translations.map(translation => <div key={translation._id} className="flex items-center space-x-2 p-3 bg-gray-800 rounded-lg">
              <div className="flex-1">
                <div className="text-white font-medium">{translation.key}</div>
                {editingKey === translation._id ? <Input value={translation.value} onChange={e => {
              const updatedTranslations = translations.map(t => t._id === translation._id ? {
                ...t,
                value: e.target.value
              } : t);
              setTranslations(updatedTranslations);
            }} className="mt-1 bg-gray-700 border-gray-600 text-white" /> : <div className="text-gray-300">{translation.value}</div>}
              </div>
              <div className="flex space-x-1">
                {editingKey === translation._id ? <>
                    <Button onClick={() => {
                handleSaveTranslation(translation.key, translation.value);
                setEditingKey(null);
              }} size="sm" className="bg-green-500 hover:bg-green-600">
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => setEditingKey(null)} size="sm" variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                      取消
                    </Button>
                  </> : <>
                    <Button onClick={() => setEditingKey(translation._id)} size="sm" variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDeleteTranslation(translation._id)} size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>}
              </div>
            </div>)}
          {translations.length === 0 && !loading && <div className="text-center py-8 text-gray-400">
              暂无翻译数据
            </div>}
        </div>
      </CardContent>
    </Card>;
}