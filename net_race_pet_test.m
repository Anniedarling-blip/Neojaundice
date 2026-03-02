%% Classify Test Images
% Classify the test images using the trained SVM model the features
% extracted from the test images.
load netTransferclas.mat
testFolder = 'E:\Face Classification\Testing';
categories = {'Adult', 'Infant'};
imds_test = imageDatastore(fullfile(testFolder,categories), 'LabelSource', 'foldernames');

tbl = countEachLabel(imds_test) %#ok<*NOPTS>
imds_test.ReadFcn = @(filename)readAndPreprocessImage(filename);


predictedLabels = classify(netTransferclas,imds_test);

%%
% Display four sample test images with their predicted labels.
idx = [10 21 2 1 11 9 8 7 123 155 165 340 360 398];
figure
for i = 1:numel(idx)
    subplot(3,3,i)
    
    I = readimage(imds_test,idx(i));
    label = predictedLabels(idx(i));
    
    imshow(I)
    title(char(label))
    drawnow
end

%%
% Calculate the classification accuracy.
testLabels = imds_test.Labels;

accuracy = sum(predictedLabels==testLabels)/numel(predictedLabels);