import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { CodeBlock } from './CodeBlock';
import { Language } from '@/types';

type BlockType = 'h1' | 'h2' | 'h3' | 'paragraph' | 'code' | 'quote' | 'list' | 'rule' | 'blank';

interface Block {
  type: BlockType;
  content: string;
  language?: Language;
  items?: string[];
}

function parseMarkdown(content: string): Block[] {
  const lines = content.split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.trimStart().startsWith('```')) {
      const rawLang = line.trim().slice(3).trim();
      const lang = (rawLang || 'text') as Language;
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'code', content: codeLines.join('\n'), language: lang });
      i++; // skip closing ```
      continue;
    }

    // Horizontal rule
    if (/^[-*_]{3,}\s*$/.test(line)) {
      blocks.push({ type: 'rule', content: '' });
      i++;
      continue;
    }

    // Headings
    if (line.startsWith('### ')) { blocks.push({ type: 'h3', content: line.slice(4) }); i++; continue; }
    if (line.startsWith('## ')) { blocks.push({ type: 'h2', content: line.slice(3) }); i++; continue; }
    if (line.startsWith('# ')) { blocks.push({ type: 'h1', content: line.slice(2) }); i++; continue; }

    // Blockquote
    if (line.startsWith('> ')) {
      blocks.push({ type: 'quote', content: line.slice(2) });
      i++;
      continue;
    }

    // List
    if (/^(\s*[-*+]|\s*\d+\.)\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^(\s*[-*+]|\s*\d+\.)\s/.test(lines[i])) {
        items.push(lines[i].replace(/^(\s*[-*+]|\s*\d+\.)\s/, ''));
        i++;
      }
      blocks.push({ type: 'list', content: '', items });
      continue;
    }

    // Blank line
    if (line.trim() === '') {
      blocks.push({ type: 'blank', content: '' });
      i++;
      continue;
    }

    // Paragraph (gather consecutive plain lines)
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('> ') &&
      !lines[i].trimStart().startsWith('```') &&
      !/^(\s*[-*+]|\s*\d+\.)\s/.test(lines[i]) &&
      !/^[-*_]{3,}\s*$/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', content: paraLines.join(' ') });
    }
  }
  return blocks;
}

interface InlineToken {
  type: 'text' | 'bold' | 'italic' | 'bolditalic' | 'code';
  content: string;
}

function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    const bi = remaining.match(/^\*\*\*(.+?)\*\*\*/);
    if (bi) { tokens.push({ type: 'bolditalic', content: bi[1] }); remaining = remaining.slice(bi[0].length); continue; }
    const bold = remaining.match(/^\*\*(.+?)\*\*/);
    if (bold) { tokens.push({ type: 'bold', content: bold[1] }); remaining = remaining.slice(bold[0].length); continue; }
    const italic = remaining.match(/^\*(.+?)\*/);
    if (italic) { tokens.push({ type: 'italic', content: italic[1] }); remaining = remaining.slice(italic[0].length); continue; }
    const code = remaining.match(/^`(.+?)`/);
    if (code) { tokens.push({ type: 'code', content: code[1] }); remaining = remaining.slice(code[0].length); continue; }
    const next = remaining.search(/\*{1,3}|`/);
    if (next === -1) { tokens.push({ type: 'text', content: remaining }); break; }
    if (next > 0) tokens.push({ type: 'text', content: remaining.slice(0, next) });
    remaining = remaining.slice(next);
  }
  return tokens;
}

interface InlineProps {
  text: string;
  baseSize?: number;
  foreground: string;
  muted: string;
  codeBg: string;
}

function Inline({ text, baseSize = 15, foreground, muted, codeBg }: InlineProps) {
  const tokens = parseInline(text);
  return (
    <Text>
      {tokens.map((tok, i) => {
        if (tok.type === 'bold') {
          return <Text key={i} style={{ fontFamily: 'Inter_700Bold', color: foreground, fontSize: baseSize }}>{tok.content}</Text>;
        }
        if (tok.type === 'italic') {
          return <Text key={i} style={{ fontFamily: 'Inter_400Regular', fontStyle: 'italic', color: foreground, fontSize: baseSize }}>{tok.content}</Text>;
        }
        if (tok.type === 'bolditalic') {
          return <Text key={i} style={{ fontFamily: 'Inter_700Bold', fontStyle: 'italic', color: foreground, fontSize: baseSize }}>{tok.content}</Text>;
        }
        if (tok.type === 'code') {
          return (
            <Text key={i} style={{ fontFamily: 'Inter_400Regular', fontSize: baseSize - 1, backgroundColor: codeBg, color: muted }}>
              {`\u202F${tok.content}\u202F`}
            </Text>
          );
        }
        return <Text key={i} style={{ fontFamily: 'Inter_400Regular', color: foreground, fontSize: baseSize }}>{tok.content}</Text>;
      })}
    </Text>
  );
}

interface Props {
  content: string;
}

export function MarkdownRenderer({ content }: Props) {
  const colors = useColors();
  const blocks = parseMarkdown(content);

  return (
    <View>
      {blocks.map((block, idx) => {
        if (block.type === 'blank') return <View key={idx} style={{ height: 6 }} />;
        if (block.type === 'rule') {
          return <View key={idx} style={[styles.rule, { backgroundColor: colors.border }]} />;
        }
        if (block.type === 'h1') {
          return (
            <Text key={idx} style={[styles.h1, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
              {block.content}
            </Text>
          );
        }
        if (block.type === 'h2') {
          return (
            <Text key={idx} style={[styles.h2, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
              {block.content}
            </Text>
          );
        }
        if (block.type === 'h3') {
          return (
            <Text key={idx} style={[styles.h3, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
              {block.content}
            </Text>
          );
        }
        if (block.type === 'quote') {
          return (
            <View key={idx} style={[styles.quote, { borderLeftColor: colors.mutedForeground }]}>
              <Inline
                text={block.content}
                foreground={colors.mutedForeground}
                muted={colors.mutedForeground}
                codeBg={colors.secondary}
              />
            </View>
          );
        }
        if (block.type === 'list') {
          return (
            <View key={idx} style={styles.list}>
              {(block.items ?? []).map((item, j) => (
                <View key={j} style={styles.listItem}>
                  <View style={[styles.bullet, { backgroundColor: colors.foreground }]} />
                  <View style={{ flex: 1 }}>
                    <Inline
                      text={item}
                      foreground={colors.foreground}
                      muted={colors.mutedForeground}
                      codeBg={colors.secondary}
                    />
                  </View>
                </View>
              ))}
            </View>
          );
        }
        if (block.type === 'code') {
          return (
            <CodeBlock key={idx} code={block.content} language={block.language ?? 'text'} />
          );
        }
        // paragraph
        return (
          <View key={idx} style={styles.para}>
            <Inline
              text={block.content}
              foreground={colors.foreground}
              muted={colors.mutedForeground}
              codeBg={colors.secondary}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 26, lineHeight: 34, marginTop: 16, marginBottom: 6 },
  h2: { fontSize: 22, lineHeight: 30, marginTop: 14, marginBottom: 4 },
  h3: { fontSize: 18, lineHeight: 26, marginTop: 12, marginBottom: 4 },
  para: { marginVertical: 3 },
  quote: { borderLeftWidth: 3, paddingLeft: 12, marginVertical: 6, opacity: 0.8 },
  list: { marginVertical: 6, gap: 5 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bullet: { width: 5, height: 5, borderRadius: 2.5, marginTop: 8 },
  rule: { height: 1, marginVertical: 14 },
});
