const responses = require('./responses.json');

const groupMatchRegex = /\$(\d*)/gi;

function extractMessage(comment, resp) {
    let regex = new RegExp(resp.pattern, 'gmi');
    let matches = regex.exec(comment.body);
    let message = null;

    if (matches && matches.length > 0) {
        //if we get to here then we can extract a response. 
        //Pick a random response to send back.
        if (resp.responses)
            message = getRandomArrayItem(resp.responses);
        else
            message = resp.response;

        //Check if the message contains a group match keyword, i.e $0, $1 ect.
        //A $ symbol followed by a number indicates the matching group to add to the text.
        let groupMatch = groupMatchRegex.exec(message);

        //Go through each match and extract the group from the original message.
        while(groupMatch != null) {
            let identifier = groupMatch[0];
            let index = parseInt(groupMatch[1]);

            if (Number.isNaN(index))
                break;

            let origGroup = matches[index + 1].trim(); //returns captured group (...) in regex

            message = message.replace(identifier, origGroup);

            groupMatch = groupMatchRegex.exec(message);
        }
    }

    //Check if the message contains any keywords.
    if (message && message.indexOf('$username') > -1) {
        message = message.replace('$username', comment.author.name);
    }

    if (message)
        message = appendFooter(message);

    return message;
}

function getRandomArrayItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function appendFooter(message) {
    //Get a random footer source text.
    let signatureText = getRandomArrayItem(responses.footer.signatures);
    let sourceText = getRandomArrayItem(responses.footer.sourceCodeTexts);
    let issuesText = getRandomArrayItem(responses.footer.issuesTexts);

    return message + `
*****

${signatureText}

^^\\(In ^^testing) [${sourceText}](${process.env.GITHUB_SOURCE_URL}) ^^| [${issuesText}](${process.env.GITHUB_ISSUES_URL})`;
}

function findAndExtractMessage(comment, arr) {
    for(let i = 0; i < arr.length; i++) {
        let resp = arr[i];
        let message = extractMessage(comment, resp);

        if (message)
            return message;
    }

    return null;
}

function handleParent(comment, parent) {
    if (parent.body.toLowerCase() == "did you ever hear the tragedy of darth plagueis the wise?") {
	let regex = new RegExp("^no[.!?]*$", 'gmi');
	let matches = regex.exec(comment.body);
	if (matches && matches.length > 0) 
	    return appendFooter("I thought not. It's not a story the Jedi would tell you. It's a Sith legend. Darth Plagueis was a Dark Lord of the Sith so powerful and so wise, he could use the Force to influence the midi-chlorians to create... life. He had such a knowledge of the Dark Side, he could even keep the ones he cared about... from dying.");
    }
    return null;
}

module.exports = {

    extractReply(comment, prevCommentIds = [], parent) {
        //make sure we're not replying to ourselves.
        if (comment.author.name === process.env.REDDIT_USER)
            return null;
    
        let message = null;

	//Check if the current comment is a correct response to a previous post
	if (parent.constructor.name == "Comment") {
	    console.log(`  (Parent: ${parent.author.name}: ${parent.body})`);
	    message = handleParent(comment, parent);
	}

        if (message)
            return message;

        if (prevCommentIds.includes(comment.parent_id)) {
            //This comment is a reply to one of ours, check for a reply.
            message = findAndExtractMessage(comment, responses.replies);
        }

        if (message)
            return message;
    
        //Try and find a response to a message.
        message = findAndExtractMessage(comment, responses.messages);

        if (message)
            return message;

        //Try and find a response to a command.
        message = findAndExtractMessage(comment, responses.commands);
    
        return message;
    }

};
