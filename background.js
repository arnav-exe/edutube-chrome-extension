const BLOCKED_CATEGORIES = [10, 17, 18, 20, 21, 23, 24, 30, 31, 34, 36, 39, 40, 41, 42, 43, 44];
const API_KEY = "";

chrome.runtime.onMessage.addListener((req, sender, sendRes) => {
    if (req.type === "CHECK_VIDEO") {
        checkVideo(req.videoId)
        .then(shouldBlock => {
            sendRes({ shouldBlock });
        });
        return true; // required for async response
    }
});

const checkVideo = async videoId => {
    try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`);
        const data = await res.json();

        if (!data.items || data.items.length === 0) {
            return false;
        }

        const video = data.items[0].snippet;

        // check if category is inside blocked categories arr
        if (BLOCKED_CATEGORIES.includes(parseInt(video.categoryId))) {
            return true;
        }

        // return !isEducationalContent(video);
    }
    catch (err) {
        console.error(err);
        return false;
    }
}

const isEducationalContent = video => {
    const educationalKeyWords = ["tutorial", "learn", "education", "how to", "course", "class", "lecture", "lesson", "guide", "explanation", "analysis", "review", "study", "research", "documentary", "science", "history", "math", "programming"];

    // education scoring system
    let score = 0;

    // title analysis (50% weightage)
    const titleWords = video.title.toLowerCase().split(" ");
    const titleScore = titleWords.reduce((acc, word) => {
        return acc + (educationalKeyWords.includes(word) ? 1 : 0);
    }, 0);

    score += (titleScore / titleWords.length) * 50;

    // description analysis (35% weightage)
    const descWords = video.description.toLowerCase().split(" ");
    const descScore = descWords.reduce((acc, word) => {
        return acc + (educationalKeywords.some(keyword => 
            word.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(word)
        ) ? 1 : 0);
    }, 0);
    score += (descScore / Math.min(descWords.length, 100)) * 35;
    
    // tag analysis (15% weightage)
    if (video.tags && video.tags.length > 0) {
        const tagScore = video.tags.reduce((acc, tag) => {
            return acc + (educationalKeywords.some(keyword =>
                tag.toLowerCase().includes(keyword.toLowerCase())
            ) ? 1 : 0);
        }, 0);
        score += (tagScore / video.tags.length) * 15;
    }
    
    // considered educational if score > 30%
    return score > 30;
}