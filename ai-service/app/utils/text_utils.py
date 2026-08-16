import re
from typing import List, Dict, Tuple

DEFAULT_FILLER_WORDS = [
  "um", "uh", "like", "you know", "actually", "basically",
  "so", "well", "i mean", "sort of", "kind of"
]

COMMON_STOPWORDS = {
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "up", "about", "into", "through", "after",
  "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
  "do", "does", "did", "i", "you", "he", "she", "it", "we", "they", "my",
  "your", "his", "her", "its", "our", "their", "this", "that", "these", "those"
}

def clean_and_tokenize(text: str) -> List[str]:
    if not text:
        return []
    # Convert to lowercase and extract words
    words = re.findall(r"\b[a-zA-Z']+\b", text.lower())
    return words

def split_sentences(text: str) -> List[str]:
    if not text:
        return []
    sentences = re.split(r"[.!?]+", text)
    return [s.strip() for s in sentences if s.strip()]

def detect_filler_words(text: str) -> Tuple[int, List[Dict]]:
    if not text:
        return 0, []

    text_lower = text.lower()
    fillers_found = []
    total_fillers = 0

    for filler in DEFAULT_FILLER_WORDS:
        # Match whole word/phrase
        pattern = r"\b" + re.escape(filler) + r"\b"
        matches = re.findall(pattern, text_lower)
        count = len(matches)
        if count > 0:
            total_fillers += count
            fillers_found.append({"word": filler, "count": count})

    return total_fillers, fillers_found

def detect_repetitions(words: List[str]) -> Tuple[int, List[Dict]]:
    if not words:
        return 0, []

    filtered_words = [w for w in words if w not in COMMON_STOPWORDS and len(w) > 2]
    counts = {}
    for w in filtered_words:
        counts[w] = counts.get(w, 0) + 1

    repeated = []
    total_repetition_instances = 0

    for word, count in counts.items():
        if count >= 3:
            total_repetition_instances += (count - 1)
            repeated.append({"word": word, "count": count})

    return total_repetition_instances, repeated

def calculate_vocabulary_metrics(words: List[str]) -> Dict:
    total_words = len(words)
    if total_words == 0:
        return {
            "totalWords": 0,
            "uniqueWordCount": 0,
            "vocabularyRichness": 0.0
        }

    unique_words = set(words)
    unique_count = len(unique_words)
    richness = round(unique_count / total_words, 2)

    return {
        "totalWords": total_words,
        "uniqueWordCount": unique_count,
        "vocabularyRichness": richness
    }
