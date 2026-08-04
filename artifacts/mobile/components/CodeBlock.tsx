import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Language } from '@/types';

type TT = 'keyword' | 'string' | 'comment' | 'number' | 'type' | 'builtin' | 'tag' | 'attr' | 'default';

interface Token {
  type: TT;
  value: string;
}

const LIGHT_SYNTAX: Record<TT, string> = {
  keyword: '#0000FF',
  string: '#A31515',
  comment: '#008000',
  number: '#098658',
  type: '#267F99',
  builtin: '#0070C1',
  tag: '#800000',
  attr: '#FF0000',
  default: '#1E1E1E',
};

const DARK_SYNTAX: Record<TT, string> = {
  keyword: '#569CD6',
  string: '#CE9178',
  comment: '#6A9955',
  number: '#B5CEA8',
  type: '#4EC9B0',
  builtin: '#DCDCAA',
  tag: '#4EC9B0',
  attr: '#9CDCFE',
  default: '#D4D4D4',
};

const KW: Partial<Record<Language, string[]>> = {
  javascript: ['const','let','var','function','return','if','else','for','while','do','switch','case','break','continue','import','export','default','class','extends','new','this','typeof','instanceof','void','null','undefined','true','false','async','await','try','catch','finally','throw','in','of','from','delete','typeof'],
  typescript: ['const','let','var','function','return','if','else','for','while','do','switch','case','break','continue','import','export','default','class','extends','new','this','typeof','instanceof','void','null','undefined','true','false','async','await','try','catch','finally','throw','in','of','from','delete','type','interface','enum','implements','namespace','as','is','readonly','public','private','protected','abstract','override','never','any','unknown','string','number','boolean','object'],
  python: ['def','class','import','from','if','elif','else','for','while','try','except','finally','with','as','return','pass','break','continue','raise','del','lambda','and','or','not','in','is','None','True','False','yield','global','nonlocal','assert','async','await','print','len','range','type','isinstance','self','super'],
  java: ['public','private','protected','class','interface','extends','implements','import','package','new','return','if','else','for','while','do','switch','case','break','continue','try','catch','finally','throw','throws','static','final','abstract','void','null','true','false','this','super','instanceof','enum','int','long','double','float','char','boolean','byte','short','String'],
  sql: ['SELECT','FROM','WHERE','JOIN','LEFT','RIGHT','INNER','OUTER','ON','GROUP','BY','ORDER','HAVING','LIMIT','OFFSET','INSERT','INTO','VALUES','UPDATE','SET','DELETE','CREATE','TABLE','DROP','ALTER','ADD','COLUMN','AND','OR','NOT','IN','IS','NULL','LIKE','BETWEEN','UNION','ALL','DISTINCT','AS','WITH','COUNT','SUM','AVG','MAX','MIN'],
  bash: ['if','then','else','elif','fi','for','do','done','while','case','esac','function','return','exit','echo','export','local','readonly','source','cd','ls','mkdir','rm','cp','mv','cat','grep','sed','awk','find','chmod','chown','sudo','apt','brew','git','curl','wget'],
  c: ['int','char','float','double','void','if','else','for','while','do','switch','case','break','continue','return','struct','union','enum','typedef','const','static','extern','sizeof','NULL','include','define','printf','scanf','malloc','free'],
  cpp: ['int','char','float','double','void','if','else','for','while','do','switch','case','break','continue','return','class','struct','namespace','template','public','private','protected','virtual','override','const','static','auto','this','new','delete','nullptr','true','false','include','using','cout','cin','endl','string','vector'],
};

function tokenize(code: string, lang: Language): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const keywords = KW[lang] ?? [];

  while (i < code.length) {
    // HTML/XML comments
    if ((lang === 'html' || lang === 'xml') && code.startsWith('<!--', i)) {
      const end = code.indexOf('-->', i + 4);
      const val = end === -1 ? code.slice(i) : code.slice(i, end + 3);
      tokens.push({ type: 'comment', value: val });
      i = end === -1 ? code.length : end + 3;
      continue;
    }
    // Block comments /* */
    if (['javascript','typescript','java','c','cpp','css','sql'].includes(lang) && code.startsWith('/*', i)) {
      const end = code.indexOf('*/', i + 2);
      const val = end === -1 ? code.slice(i) : code.slice(i, end + 2);
      tokens.push({ type: 'comment', value: val });
      i = end === -1 ? code.length : end + 2;
      continue;
    }
    // Line comment //
    if (['javascript','typescript','java','c','cpp'].includes(lang) && code.startsWith('//', i)) {
      const end = code.indexOf('\n', i);
      const val = end === -1 ? code.slice(i) : code.slice(i, end);
      tokens.push({ type: 'comment', value: val });
      i = end === -1 ? code.length : end;
      continue;
    }
    // Hash comment
    if (['python','bash','yaml'].includes(lang) && code[i] === '#') {
      const end = code.indexOf('\n', i);
      const val = end === -1 ? code.slice(i) : code.slice(i, end);
      tokens.push({ type: 'comment', value: val });
      i = end === -1 ? code.length : end;
      continue;
    }
    // SQL -- comment
    if (lang === 'sql' && code.startsWith('--', i)) {
      const end = code.indexOf('\n', i);
      const val = end === -1 ? code.slice(i) : code.slice(i, end);
      tokens.push({ type: 'comment', value: val });
      i = end === -1 ? code.length : end;
      continue;
    }
    // Strings
    if (code[i] === '"' || code[i] === "'") {
      const q = code[i];
      let j = i + 1;
      while (j < code.length && (code[j] !== q || code[j - 1] === '\\') && code[j] !== '\n') j++;
      const val = code.slice(i, j + 1);
      tokens.push({ type: 'string', value: val });
      i = j + 1;
      continue;
    }
    // Template literals
    if (code[i] === '`') {
      let j = i + 1;
      while (j < code.length && (code[j] !== '`' || code[j - 1] === '\\')) j++;
      const val = code.slice(i, j + 1);
      tokens.push({ type: 'string', value: val });
      i = j + 1;
      continue;
    }
    // Numbers
    if (/\d/.test(code[i]) && (i === 0 || !/\w/.test(code[i - 1]))) {
      let j = i;
      while (j < code.length && /[\d._xbXB]/.test(code[j])) j++;
      tokens.push({ type: 'number', value: code.slice(i, j) });
      i = j;
      continue;
    }
    // HTML tags
    if ((lang === 'html' || lang === 'xml') && code[i] === '<' && /[a-zA-Z/!]/.test(code[i + 1] ?? '')) {
      const end = code.indexOf('>', i);
      const val = end === -1 ? code.slice(i) : code.slice(i, end + 1);
      tokens.push({ type: 'tag', value: val });
      i = end === -1 ? code.length : end + 1;
      continue;
    }
    // Words (keywords / identifiers)
    if (/[a-zA-Z_$]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_$]/.test(code[j])) j++;
      const word = code.slice(i, j);
      const isKw = keywords.includes(word);
      tokens.push({ type: isKw ? 'keyword' : 'default', value: word });
      i = j;
      continue;
    }
    // Default: one char
    tokens.push({ type: 'default', value: code[i] });
    i++;
  }
  return tokens;
}

// Build per-line token arrays
function buildLines(tokens: Token[]): Token[][] {
  const lines: Token[][] = [[]];
  for (const tok of tokens) {
    const parts = tok.value.split('\n');
    for (let p = 0; p < parts.length; p++) {
      if (parts[p].length > 0) {
        lines[lines.length - 1].push({ type: tok.type, value: parts[p] });
      }
      if (p < parts.length - 1) {
        lines.push([]);
      }
    }
  }
  return lines;
}

interface Props {
  code: string;
  language?: Language;
  showLineNumbers?: boolean;
}

export function CodeBlock({ code, language = 'text', showLineNumbers = true }: Props) {
  const colors = useColors();
  const [copied, setCopied] = useState(false);
  const syntax = colors.isDark ? DARK_SYNTAX : LIGHT_SYNTAX;
  const bgColor = colors.isDark ? '#1E1E1E' : '#F8F8F8';

  const handleCopy = async () => {
    try {
      if (Platform.OS !== 'web') {
        const Clipboard = await import('expo-clipboard');
        await Clipboard.setStringAsync(code);
      }
    } catch {
      // ignore clipboard errors
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = buildLines(tokenize(code, language));

  return (
    <View style={[styles.wrapper, { backgroundColor: bgColor, borderColor: colors.border }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.langLabel, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
          {language === 'text' ? 'plaintext' : language}
        </Text>
        <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} activeOpacity={0.7}>
          <Feather
            name={copied ? 'check' : 'copy'}
            size={13}
            color={copied ? colors.success : colors.mutedForeground}
          />
          <Text
            style={[
              styles.copyLabel,
              {
                color: copied ? colors.success : colors.mutedForeground,
                fontFamily: 'Inter_500Medium',
              },
            ]}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View>
          {lines.map((line, li) => (
            <View key={li} style={styles.lineRow}>
              {showLineNumbers ? (
                <Text
                  style={[
                    styles.lineNum,
                    { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
                  ]}
                >
                  {String(li + 1).padStart(String(lines.length).length, ' ')}
                </Text>
              ) : null}
              <Text>
                {line.length === 0 ? (
                  <Text style={[styles.code, { color: syntax.default }]}>{' '}</Text>
                ) : (
                  line.map((tok, ti) => (
                    <Text key={ti} style={[styles.code, { color: syntax[tok.type] }]}>
                      {tok.value}
                    </Text>
                  ))
                )}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderBottomWidth: 1,
  },
  langLabel: {
    fontSize: 12,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  copyLabel: {
    fontSize: 12,
  },
  scroll: {
    padding: 14,
  },
  scrollContent: {
    paddingBottom: 4,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 18,
  },
  lineNum: {
    fontSize: 12,
    width: 36,
    textAlign: 'right',
    paddingRight: 14,
    opacity: 0.4,
    lineHeight: 18,
  },
  code: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Inter_400Regular',
  },
});
