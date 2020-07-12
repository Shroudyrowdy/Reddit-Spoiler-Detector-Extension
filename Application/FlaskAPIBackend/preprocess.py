# File to handle all the Text Preprocessing
import re

# Compiling the Regex for the replacement words
def get_replace(replace_dict):
    replace_re = re.compile('(%s)' % '|'.join(replace_dict.keys()))
    return replace_dict, replace_re

# Handling of hex strings and apostrophes
def advancedcleaning(text):
    text = re.sub('\x97', '', text)
    text = re.sub('\x96', '', text)
    text = re.sub('\x95', '', text)
    text = re.sub('\x85', '', text)
    text = re.sub('\xa0', '', text)
    text = re.sub("'s", " 's", text)
    text = re.sub("s'", "s 's", text)
    return text

# Main Replace Function
def replace_list(textlist):
    def replace(match):
        return replacements[match.group(0)]
    cleanedwords = []
    for string in textlist:
        string = string.lower()
        half_cleaned = replace_re.sub(replace,string)
        cleanedwords.append(advancedcleaning(half_cleaned))
    return cleanedwords

# Replacement Dictionary
# Expands most abbreviations found in the data
# Also replaces 2 misspellings that are not found in embedding
# Can be further refined to include more mispellings/alternative spellings
replace_dict = {"it´s":'it is', "it's":'it is', "he's":'he is',
                "let's":'let us', "she's":'she is', "who's":'who is',
                "that's":'that is', "what's":'what is', "here's":'here is',
                "there's":'there is',
                "i'm":'i am',
                "i've":'i have', "we've":'we have', "you've":'you have',
                "they've":'they have', "they've":'they have',
                "would've":'would have', "could've":'could have',
                "should've":'should have', "who've":'who have',
                "we're":'we are', "you're":'you are', "they're":'they are',
                "i'll":'i will', "it'll":'it will', "he'll":'he will',
                "we'll":'we will', "you'll":'you will', "they'll":'they will',
                "that'll":'that will',
                "i'd":'i had', "you'd":'you had', "he'd":'he had',
                "it'd":'it had', "we'd":'we had', "who'd":"who had",
                "they'd":'they had',
                "ain't":'am not', "don´t":'do not', "don't":'do not',
                "isn't":'is not', "can't":'cannot', "hadn't":'had not',
                "aren't":'are not', "didn't":'did not', "hasn't":'has not',
                "wasn't":'was not', "won't":'would not', "haven't":'have not',
                "weren't":'were not', "doesn´t":'does not',
                "doesn't":'does not', "couldn't":'could not',
                "wouldn't":'would not', "shouldn't":'should not',
                "singin'":"singing", 'bluray':'blu-ray'
                }

replacements, replace_re = get_replace(replace_dict)
